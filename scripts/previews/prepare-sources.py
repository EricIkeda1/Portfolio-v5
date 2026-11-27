import json, pathlib, shutil, subprocess, urllib.request, re
from datetime import datetime, timezone
import django
from django.conf import settings
from django.template.loader import render_to_string
from django.urls import path
from django.http import HttpResponse
root=pathlib.Path.cwd()
out=root/'public/project-previews'
out.mkdir(parents=True,exist_ok=True)

def download(url,destination):
    urllib.request.urlretrieve(url,str(destination))

# Public cover, explicitly supplied by the document page's Open Graph metadata.
download('https://files.passeidireto.com/Thumbnail/2900c236-de8d-4cbc-92fc-1d20119ce392/520/1.jpg',out/'manual-unisenai.jpg')
# A real frame from the demonstration already published in the author's README.
download('https://github.com/user-attachments/assets/ad20dd1c-f689-422a-8f4a-77b2ab65c8cc','/tmp/temperlights.mp4')
subprocess.run(['ffmpeg','-loglevel','error','-ss','1.6','-i','/tmp/temperlights.mp4','-frames:v','1','-y',str(out/'temperlights.jpg')],check=True)
# Render the original Django login template against isolated settings: no production DB.
source=root/'preview-sources/x4/Projeto/Frontend/GlassHub/GlassHubApp'
html=(source/'templates/login.html').read_text()
names=set(re.findall(r"{%\s*url\s+['\"]([^'\"]+)",html))
urlpatterns=[path(name+'/',lambda request:HttpResponse(''),name=name) for name in names]
settings.configure(DEBUG=False,SECRET_KEY='local-render-only',ROOT_URLCONF=__name__,STATIC_URL='/static/',INSTALLED_APPS=['django.contrib.staticfiles'],TEMPLATES=[{'BACKEND':'django.template.backends.django.DjangoTemplates','DIRS':[str(source/'templates')]}])
django.setup()
site=root/'preview-sources/rendered'
site.mkdir(parents=True,exist_ok=True)
shutil.copytree(source/'static',site/'static',dirs_exist_ok=True)
(site/'index.html').write_text(render_to_string('login.html',{'csrf_token':'preview-only'}))
# Flutter screenshot produced by the real widget, not an invented interface.
subprocess.run(['ffmpeg','-loglevel','error','-i','preview-sources/ademiconnect/Mobile/test/generated/ademiconnect.png','-frames:v','1','-y',str(out/'ademiconnect.jpg')],check=True)
now=datetime.now(timezone.utc).isoformat()
manifest={
 'ericikeda1/ademiconnect':{'image_url':'/project-previews/ademiconnect.jpg','kind':'mobile','label':'Tela de entrada · Flutter original'},
 'ericikeda1/temperlights-mobile':{'image_url':'/project-previews/temperlights.jpg','kind':'mobile','label':'Captura do vídeo original'},
 'ericikeda1/x4glass':{'image_url':'/project-previews/x4glass.jpg','kind':'desktop','label':'Tela de entrada · Django original'},
}
content=json.load(urllib.request.urlopen('https://www.ericyikeda.com.br/api/content'))
for project in content['projects']:
    url=project.get('github','')
    if 'passeidireto.com/arquivo/149832995/' in url:
        manifest[url.rstrip('/').lower()]={'image_url':'/project-previews/manual-unisenai.jpg','kind':'document','label':'Capa original · Manual UniSenai 2024'}
for item in manifest.values():item['captured_at']=now
(out/'source-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
