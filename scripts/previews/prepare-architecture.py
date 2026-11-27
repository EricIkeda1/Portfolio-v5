from django.template import Engine, Context
from datetime import datetime
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from django.db.models import Sum
from django.utils import timezone
arch=root/'preview-sources/architecture/Login/cadastro_app'
# Run the project's actual plotting functions with in-memory example records only.
code=(arch/'graficos.py').read_text()
code=code.replace('from .models import Venda, Produto, VendaItem','')
ns={}
exec(compile(code,str(arch/'graficos.py'),'exec'),ns)
class Records(list):
    def values(self,*keys):
        return Records([{key:row[key] for key in keys} for row in self])
    def filter(self,**kwargs):
        return self
    def annotate(self,**kwargs):
        return Records([{'grupo':i+1,'total_vendido':v} for i,v in enumerate([1450,1100,850])])
products=Records([{'id':i+1,'nome':name,'preco_custo':10+i*3,'preco_venda':20+i*5,'quantidade_comprado':150+i*20,'quantidade_vendido':80+i*15,'grupo':i+1} for i,name in enumerate(['Granola integral','Castanhas','Mel orgânico','Chá natural','Aveia','Farinha integral'])])
sales=Records([{'data_hora_venda':datetime(2026,i+1,15),'valor_total':1200+i*430} for i in range(6)])
items=Records([{'produto':i+1,'quantidade':10+i,'valor_total':400+i*70} for i in range(6)])
ctx={}
for key,args in [('linha',(sales,products)),('barras',(sales,products)),('dispersao',(items,products)),('pizza',(products,)),('barras_linha',(products,))]:
    fig=ns['create_fig_'+key](*args)
    ctx['fig_'+key]=fig.to_html(full_html=False,include_plotlyjs=True)
ctx['estoque_baixo']=[{'nome':'Chá natural','descricao':'Exemplo para demonstração','quantidade_comprado':25,'quantidade_vendido':20,'fabricante':'Fabricante exemplo'}]
urlpatterns.append(path('inicio/',lambda request:HttpResponse(''),name='inicio'))
archsite=site/'architecture'
archsite.mkdir(parents=True,exist_ok=True)
shutil.copytree(arch/'static',archsite/'static',dirs_exist_ok=True)
engine=Engine(dirs=[str(arch/'templates')],libraries={'static':'django.templatetags.static'})
(archsite/'index.html').write_text(engine.get_template('Graficos.html').render(Context(ctx)).replace('/static/','/architecture/static/'))
