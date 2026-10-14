/* ≡-menyen under 768 px på sider som ikke har eget skript for den (/dokumenter/). Ingen inline-skript (CSP). */
(function(){
var kn=document.getElementById('menyknapp'),meny=document.getElementById('meny');
if(!kn||!meny)return;
kn.onclick=function(){var apen=meny.classList.toggle('apen');kn.setAttribute('aria-expanded',apen)};
})();
