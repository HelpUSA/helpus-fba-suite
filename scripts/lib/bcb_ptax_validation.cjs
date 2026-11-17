'use strict';
/** BCB PTAX source parsing, no network or database. */
function isValidDate(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const [y,m,d]=value.split('-').map(Number);
  if(y<2000||y>2100||m<1||m>12)return false;
  const days=new Date(Date.UTC(y,m,0)).getUTCDate();
  return d>=1&&d<=days;
}
function buildBcbUrl(date){
  if(!isValidDate(date))throw new Error('INVALID_DATE');
  const [y,m,d]=date.split('-');
  const quoted="'"+m+"-"+d+"-"+y+"'";
  const url=new URL('https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)');
  url.searchParams.set('@dataCotacao',quoted);
  url.searchParams.set('$format','json');
  return url.toString();
}
function readClosingObservation(body,date){
  if(!isValidDate(date)||!body||!Array.isArray(body.value))throw new Error('BCB_PAYLOAD_INVALID');
  const wanted=body.value.filter(item=>typeof item.tipoBoletim==='string'&&item.tipoBoletim.trim().toLowerCase()==='fechamento');
  if(wanted.length!==1)throw new Error('BCB_CLOSING_BULLETIN_NOT_UNIQUE');
  const item=wanted[0];
  if(typeof item.cotacaoVenda!=='number'||!Number.isFinite(item.cotacaoVenda)||item.cotacaoVenda<=0)throw new Error('BCB_RATE_INVALID');
  if(typeof item.dataHoraCotacao!=='string'||item.dataHoraCotacao.slice(0,10)!==date)throw new Error('BCB_BULLETIN_DATE_MISMATCH');
  const fourDigits=Math.round(item.cotacaoVenda*10000)/10000;
  if(Math.abs(item.cotacaoVenda-fourDigits)>0.00000001)throw new Error('BCB_RATE_PRECISION_UNSUPPORTED');
  return {rate:fourDigits,timestamp:item.dataHoraCotacao};
}
module.exports={isValidDate,buildBcbUrl,readClosingObservation};
