import re
from pathlib import Path
# Modify only the disposable capture checkout; original UI widgets stay unchanged.
p=Path('preview-sources/ademiconnect/Mobile/lib/telas/gestor/home_gestor.dart')
s=p.read_text()
old="""    _carregarLeads(initial: true);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _carregarQtdAvisos();
    });"""
new="""    _loading = false;
    _leads.addAll([
      {'id':1,'nome':'Cliente demonstração 01','tel':'','end':'Ibiporã · Centro','estab':'Comércio de exemplo','bairro':'Centro','cons':'Consultor exemplo','obs':'Retorno agendado para apresentar a proposta.','dias':12,'urgente':false,'alerta':false,'status':'Negociação'},
      {'id':2,'nome':'Cliente demonstração 02','tel':'','end':'Londrina · Centro','estab':'Empresa de exemplo','bairro':'Centro','cons':'Consultor exemplo','obs':'Primeiro contato realizado.','dias':7,'urgente':false,'alerta':false,'status':'Conexão'},
      {'id':3,'nome':'Cliente demonstração 03','tel':'','end':'Ibiporã · Centro','estab':'Loja de exemplo','bairro':'Centro','cons':'Consultor exemplo','obs':'Acompanhamento da negociação.','dias':5,'urgente':false,'alerta':false,'status':'Negociação'},
    ]);"""
assert old in s, 'Manager initialization changed; review capture fixture'
p.write_text(s.replace(old,new))

# Explicit font for standalone RichText and bottom-menu labels in Flutter golden tests.
for relative in ['telas/widgets/lead_card.dart','telas/gestor/components/menu_inferior.dart']:
    f=Path('preview-sources/ademiconnect/Mobile/lib')/relative
    text=f.read_text()
    assert 'fontFamily:' not in text, 'Review explicit fonts before applying screenshot fallback'
    f.write_text(re.sub(r'\bTextStyle\(', "TextStyle(fontFamily: 'Roboto', ", text))
