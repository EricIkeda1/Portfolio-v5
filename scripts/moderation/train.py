"""Reproducible local baseline. Dataset is never committed or used at runtime.
Usage: python scripts/moderation/train.py /path/to/ToLD-BR.csv
Requires numpy, scipy, scikit-learn. See MODERATION.md for provenance/limitations.
"""
import csv, json, re, unicodedata, sys, hashlib
from pathlib import Path
from collections import Counter
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_recall_fscore_support, confusion_matrix

ROOT = Path(__file__).resolve().parents[2]
SIZE = 32768

def normalize(text):
    text = unicodedata.normalize('NFKD', text.lower())
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r'https?://\S+|www\.\S+|@[\w_]+', ' ', text)
    text = re.sub('[\u200b-\u200f\u202a-\u202e\u2060\ufeff]', '', text)
    return re.sub(r'[^a-z0-9]+', ' ', text).strip()

def fnv(text):
    h = 2166136261
    for c in text:
        h = ((h ^ ord(c)) * 16777619) & 0xffffffff
    return h % SIZE

def features(text):
    text = normalize(text)
    words = text.split()
    counts = Counter()
    for n in (1,2,3):
        for i in range(len(words)-n+1): counts[fnv('w:'+' '.join(words[i:i+n]))] += 1
    padded = ' '+text+' '
    for n in (3,4,5):
        for i in range(len(padded)-n+1): counts[fnv('c:'+padded[i:i+n])] += 1
    return counts

def matrix(texts):
    indices=[]; values=[]; pointers=[0]
    for t in texts:
        f=features(t); indices.extend(f); values.extend(f.values()); pointers.append(len(indices))
    return csr_matrix((values,indices,pointers),shape=(len(texts),SIZE),dtype=np.float64)

def metric(labels, scores, threshold):
    predicted=scores>=threshold
    p,r,f,_=precision_recall_fscore_support(labels,predicted,average='binary',zero_division=0)
    return dict(precision=round(float(p),4),recall=round(float(r),4),f1=round(float(f),4),confusion_matrix=confusion_matrix(labels,predicted).tolist())

raw=Path(sys.argv[1]).read_bytes()
if hashlib.sha256(raw).hexdigest() != 'a905b90d5886b9c80d737aa26c41dd29077155f23b9b857080634a78f8203c90':
    raise ValueError('Unexpected dataset version; review provenance before retraining.')
rows=list(csv.DictReader(raw.decode('utf8').splitlines()))
print('Dataset:',len(rows),'rows; columns:',list(rows[0]),flush=True)
seen={}
for row in rows:
    text=row.get('text') or row.get('tweet')
    label=int(any(float(row[k])>=2 for k in ['homophobia','obscene','insult','racism','misogyny','xenophobia']))
    key=normalize(text)
    if key and len(key)<=5000: seen[key]=max(label,seen.get(key,0))
texts=np.array(list(seen)); labels=np.array(list(seen.values()))
train,heldout=train_test_split(np.arange(len(texts)),test_size=.2,stratify=labels,random_state=42)
validation,test=train_test_split(heldout,test_size=.5,stratify=labels[heldout],random_state=42)
examples=json.loads((ROOT/'scripts/moderation/threat-examples.json').read_text())
# Synthetic threat/benign contrasts supplement a dataset without a threat-specific label.
extra=[]; extra_labels=[]
for label,key in [(1,'threats'),(0,'safe')]:
    for phrase in examples[key]:
        for prefix in ['', 'eric ', 'olha ', 'escuta ', 'agora ', 'amanha ', 'eu disse que ', 'se liga ']:
            for suffix in ['', ' viu', ' pode esperar', ' sim', ' de verdade']:
                extra.append(prefix+phrase+suffix);extra_labels.append(label)
xtrain=matrix(list(texts[train])+extra);ytrain=np.concatenate([labels[train],extra_labels])
print('Training',xtrain.shape,flush=True)
tfidf=TfidfTransformer(sublinear_tf=True).fit(xtrain)
xtrain=tfidf.transform(xtrain)
model=LogisticRegression(C=4,max_iter=300,solver='liblinear',class_weight='balanced',random_state=42).fit(xtrain,ytrain)
validation_scores=model.predict_proba(tfidf.transform(matrix(texts[validation])))[:,1]
# Favor precision; do not represent a score as calibrated certainty.
threshold=.80
candidates=[]
for value in np.arange(.70,.991,.01):
    m=metric(labels[validation],validation_scores,float(value))
    if m['precision']>=.80 and m['recall']>=.25: candidates.append((value,m['f1']))
if candidates: threshold=float(max(candidates,key=lambda x:x[1])[0])
test_metrics=metric(labels[test],model.predict_proba(tfidf.transform(matrix(texts[test])))[:,1],threshold)
output=dict(version='eyi-moderation-pt-v1',license='CC-BY-SA-4.0',training_source='https://github.com/joaoaleite/ToLD-Br',algorithm='hashed-ngram-logistic-regression',feature_count=SIZE,threshold=round(threshold,4),intercept=round(float(model.intercept_[0]),7),weights=[round(float(v),7) for v in model.coef_[0]],idf=[round(float(v),7) for v in tfidf.idf_],dataset_sha256=hashlib.sha256(raw).hexdigest())
(ROOT/'api/_lib/moderation/model.json').write_text(json.dumps(output,separators=(',',':'))+'\n')
report=dict(dataset='ToLD-Br',source='https://github.com/joaoaleite/ToLD-Br',license='CC-BY-SA-4.0',raw_rows=len(rows),deduplicated_rows=len(texts),training_rows=len(train),synthetic_training_rows=len(extra),validation_rows=len(validation),test_rows=len(test),threshold=output['threshold'],held_out_test=test_metrics,dataset_sha256=output['dataset_sha256'],note='Held-out source-domain baseline, not a guarantee or measurement of real portfolio threats. Synthetic threats are training-only; no portfolio messages are used.')
(ROOT/'scripts/moderation/evaluation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2),flush=True)
for phrase in ['vou te matar','Seu projeto esta lento e precisa melhorar','Voce me mata de rir','vou quebrar sua cara','Vou tirar sua vida hoje','Voce vai pagar com sangue']:
    print(repr(phrase),round(float(model.predict_proba(tfidf.transform(matrix([phrase])))[0,1]),3),flush=True)
