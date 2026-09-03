var De=Object.defineProperty;var Re=(o,e,t)=>e in o?De(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var V=(o,e,t)=>Re(o,typeof e!="symbol"?e+"":e,t);var B=window,H=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Q=Symbol(),de=new WeakMap,z=class{constructor(e,t,a){if(this._$cssResult$=!0,a!==Q)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(H&&e===void 0){let a=t!==void 0&&t.length===1;a&&(e=de.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),a&&de.set(t,e))}return e}toString(){return this.cssText}},he=o=>new z(typeof o=="string"?o:o+"",void 0,Q),N=(o,...e)=>{let t=o.length===1?o[0]:e.reduce(((a,r,i)=>a+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+o[i+1]),o[0]);return new z(t,o,Q)},G=(o,e)=>{H?o.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((t=>{let a=document.createElement("style"),r=B.litNonce;r!==void 0&&a.setAttribute("nonce",r),a.textContent=t.cssText,o.appendChild(a)}))},O=H?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(let a of e.cssRules)t+=a.cssText;return he(t)})(o):o;var Z,q=window,pe=q.trustedTypes,je=pe?pe.emptyScript:"",ue=q.reactiveElementPolyfillSupport,K={toAttribute(o,e){switch(e){case Boolean:o=o?je:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},ve=(o,e)=>e!==o&&(e==e||o==o),W={attribute:!0,type:String,converter:K,reflect:!1,hasChanged:ve},J="finalized",b=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();let e=[];return this.elementProperties.forEach(((t,a)=>{let r=this._$Ep(a,t);r!==void 0&&(this._$Ev.set(r,a),e.push(r))})),e}static createProperty(e,t=W){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){let a=typeof e=="symbol"?Symbol():"__"+e,r=this.getPropertyDescriptor(e,a,t);r!==void 0&&Object.defineProperty(this.prototype,e,r)}}static getPropertyDescriptor(e,t,a){return{get(){return this[t]},set(r){let i=this[e];this[t]=r,this.requestUpdate(e,i,a)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||W}static finalize(){if(this.hasOwnProperty(J))return!1;this[J]=!0;let e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){let t=this.properties,a=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(let r of a)this.createProperty(r,t[r])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let a=new Set(e.flat(1/0).reverse());for(let r of a)t.unshift(O(r))}else e!==void 0&&t.push(O(e));return t}static _$Ep(e,t){let a=t.attribute;return a===!1?void 0:typeof a=="string"?a:typeof e=="string"?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach((t=>t(this)))}addController(e){var t,a;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((a=e.hostConnected)===null||a===void 0||a.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])}))}createRenderRoot(){var e;let t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return G(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach((t=>{var a;return(a=t.hostConnected)===null||a===void 0?void 0:a.call(t)}))}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach((t=>{var a;return(a=t.hostDisconnected)===null||a===void 0?void 0:a.call(t)}))}attributeChangedCallback(e,t,a){this._$AK(e,a)}_$EO(e,t,a=W){var r;let i=this.constructor._$Ep(e,a);if(i!==void 0&&a.reflect===!0){let n=(((r=a.converter)===null||r===void 0?void 0:r.toAttribute)!==void 0?a.converter:K).toAttribute(t,a.type);this._$El=e,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$El=null}}_$AK(e,t){var a;let r=this.constructor,i=r._$Ev.get(e);if(i!==void 0&&this._$El!==i){let n=r.getPropertyOptions(i),c=typeof n.converter=="function"?{fromAttribute:n.converter}:((a=n.converter)===null||a===void 0?void 0:a.fromAttribute)!==void 0?n.converter:K;this._$El=i,this[i]=c.fromAttribute(t,n.type),this._$El=null}}requestUpdate(e,t,a){let r=!0;e!==void 0&&(((a=a||this.constructor.getPropertyOptions(e)).hasChanged||ve)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),a.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,a))):r=!1),!this.isUpdatePending&&r&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((r,i)=>this[i]=r)),this._$Ei=void 0);let t=!1,a=this._$AL;try{t=this.shouldUpdate(a),t?(this.willUpdate(a),(e=this._$ES)===null||e===void 0||e.forEach((r=>{var i;return(i=r.hostUpdate)===null||i===void 0?void 0:i.call(r)})),this.update(a)):this._$Ek()}catch(r){throw t=!1,this._$Ek(),r}t&&this._$AE(a)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach((a=>{var r;return(r=a.hostUpdated)===null||r===void 0?void 0:r.call(a)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach(((t,a)=>this._$EO(a,this[a],t))),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}};b[J]=!0,b.elementProperties=new Map,b.elementStyles=[],b.shadowRootOptions={mode:"open"},ue?.({ReactiveElement:b}),((Z=q.reactiveElementVersions)!==null&&Z!==void 0?Z:q.reactiveElementVersions=[]).push("1.6.3");var Y,U=window,S=U.trustedTypes,ge=S?S.createPolicy("lit-html",{createHTML:o=>o}):void 0,ee="$lit$",x=`lit$${(Math.random()+"").slice(9)}$`,ye="?"+x,Be=`<${ye}>`,k=document,E=()=>k.createComment(""),P=o=>o===null||typeof o!="object"&&typeof o!="function",$e=Array.isArray,He=o=>$e(o)||typeof o?.[Symbol.iterator]=="function",X=`[ 	
\f\r]`,M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,fe=/-->/g,me=/>/g,y=RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),be=/'/g,_e=/"/g,ke=/^(?:script|style|textarea|title)$/i,Ae=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),s=Ae(1),Xe=Ae(2),_=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),xe=new WeakMap,$=k.createTreeWalker(k,129,null,!1);function Se(o,e){if(!Array.isArray(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return ge!==void 0?ge.createHTML(e):e}var Ne=(o,e)=>{let t=o.length-1,a=[],r,i=e===2?"<svg>":"",n=M;for(let c=0;c<t;c++){let p=o[c],l,u,v=-1,f=0;for(;f<p.length&&(n.lastIndex=f,u=n.exec(p),u!==null);)f=n.lastIndex,n===M?u[1]==="!--"?n=fe:u[1]!==void 0?n=me:u[2]!==void 0?(ke.test(u[2])&&(r=RegExp("</"+u[2],"g")),n=y):u[3]!==void 0&&(n=y):n===y?u[0]===">"?(n=r??M,v=-1):u[1]===void 0?v=-2:(v=n.lastIndex-u[2].length,l=u[1],n=u[3]===void 0?y:u[3]==='"'?_e:be):n===_e||n===be?n=y:n===fe||n===me?n=M:(n=y,r=void 0);let m=n===y&&o[c+1].startsWith("/>")?" ":"";i+=n===M?p+Be:v>=0?(a.push(l),p.slice(0,v)+ee+p.slice(v)+x+m):p+x+(v===-2?(a.push(void 0),c):m)}return[Se(o,i+(o[t]||"<?>")+(e===2?"</svg>":"")),a]},T=class o{constructor({strings:e,_$litType$:t},a){let r;this.parts=[];let i=0,n=0,c=e.length-1,p=this.parts,[l,u]=Ne(e,t);if(this.el=o.createElement(l,a),$.currentNode=this.el.content,t===2){let v=this.el.content,f=v.firstChild;f.remove(),v.append(...f.childNodes)}for(;(r=$.nextNode())!==null&&p.length<c;){if(r.nodeType===1){if(r.hasAttributes()){let v=[];for(let f of r.getAttributeNames())if(f.endsWith(ee)||f.startsWith(x)){let m=u[n++];if(v.push(f),m!==void 0){let Ie=r.getAttribute(m.toLowerCase()+ee).split(x),j=/([.?@])?(.*)/.exec(m);p.push({type:1,index:i,name:j[2],strings:Ie,ctor:j[1]==="."?ae:j[1]==="?"?re:j[1]==="@"?se:L})}else p.push({type:6,index:i})}for(let f of v)r.removeAttribute(f)}if(ke.test(r.tagName)){let v=r.textContent.split(x),f=v.length-1;if(f>0){r.textContent=S?S.emptyScript:"";for(let m=0;m<f;m++)r.append(v[m],E()),$.nextNode(),p.push({type:2,index:++i});r.append(v[f],E())}}}else if(r.nodeType===8)if(r.data===ye)p.push({type:2,index:i});else{let v=-1;for(;(v=r.data.indexOf(x,v+1))!==-1;)p.push({type:7,index:i}),v+=x.length-1}i++}}static createElement(e,t){let a=k.createElement("template");return a.innerHTML=e,a}};function C(o,e,t=o,a){var r,i,n,c;if(e===_)return e;let p=a!==void 0?(r=t._$Co)===null||r===void 0?void 0:r[a]:t._$Cl,l=P(e)?void 0:e._$litDirective$;return p?.constructor!==l&&((i=p?._$AO)===null||i===void 0||i.call(p,!1),l===void 0?p=void 0:(p=new l(o),p._$AT(o,t,a)),a!==void 0?((n=(c=t)._$Co)!==null&&n!==void 0?n:c._$Co=[])[a]=p:t._$Cl=p),p!==void 0&&(e=C(o,p._$AS(o,e.values),p,a)),e}var te=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;let{el:{content:a},parts:r}=this._$AD,i=((t=e?.creationScope)!==null&&t!==void 0?t:k).importNode(a,!0);$.currentNode=i;let n=$.nextNode(),c=0,p=0,l=r[0];for(;l!==void 0;){if(c===l.index){let u;l.type===2?u=new I(n,n.nextSibling,this,e):l.type===1?u=new l.ctor(n,l.name,l.strings,this,e):l.type===6&&(u=new ie(n,this,e)),this._$AV.push(u),l=r[++p]}c!==l?.index&&(n=$.nextNode(),c++)}return $.currentNode=k,i}v(e){let t=0;for(let a of this._$AV)a!==void 0&&(a.strings!==void 0?(a._$AI(e,a,t),t+=a.strings.length-2):a._$AI(e[t])),t++}},I=class o{constructor(e,t,a,r){var i;this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=a,this.options=r,this._$Cp=(i=r?.isConnected)===null||i===void 0||i}get _$AU(){var e,t;return(t=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&t!==void 0?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=C(this,e,t),P(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==_&&this._(e):e._$litType$!==void 0?this.g(e):e.nodeType!==void 0?this.$(e):He(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==d&&P(this._$AH)?this._$AA.nextSibling.data=e:this.$(k.createTextNode(e)),this._$AH=e}g(e){var t;let{values:a,_$litType$:r}=e,i=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=T.createElement(Se(r.h,r.h[0]),this.options)),r);if(((t=this._$AH)===null||t===void 0?void 0:t._$AD)===i)this._$AH.v(a);else{let n=new te(i,this),c=n.u(this.options);n.v(a),this.$(c),this._$AH=n}}_$AC(e){let t=xe.get(e.strings);return t===void 0&&xe.set(e.strings,t=new T(e)),t}T(e){$e(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,a,r=0;for(let i of e)r===t.length?t.push(a=new o(this.k(E()),this.k(E()),this,this.options)):a=t[r],a._$AI(i),r++;r<t.length&&(this._$AR(a&&a._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){var a;for((a=this._$AP)===null||a===void 0||a.call(this,!1,!0,t);e&&e!==this._$AB;){let r=e.nextSibling;e.remove(),e=r}}setConnected(e){var t;this._$AM===void 0&&(this._$Cp=e,(t=this._$AP)===null||t===void 0||t.call(this,e))}},L=class{constructor(e,t,a,r,i){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,a.length>2||a[0]!==""||a[1]!==""?(this._$AH=Array(a.length-1).fill(new String),this.strings=a):this._$AH=d}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,a,r){let i=this.strings,n=!1;if(i===void 0)e=C(this,e,t,0),n=!P(e)||e!==this._$AH&&e!==_,n&&(this._$AH=e);else{let c=e,p,l;for(e=i[0],p=0;p<i.length-1;p++)l=C(this,c[a+p],t,p),l===_&&(l=this._$AH[p]),n||(n=!P(l)||l!==this._$AH[p]),l===d?e=d:e!==d&&(e+=(l??"")+i[p+1]),this._$AH[p]=l}n&&!r&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ae=class extends L{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},Oe=S?S.emptyScript:"",re=class extends L{constructor(){super(...arguments),this.type=4}j(e){e&&e!==d?this.element.setAttribute(this.name,Oe):this.element.removeAttribute(this.name)}},se=class extends L{constructor(e,t,a,r,i){super(e,t,a,r,i),this.type=5}_$AI(e,t=this){var a;if((e=(a=C(this,e,t,0))!==null&&a!==void 0?a:d)===_)return;let r=this._$AH,i=e===d&&r!==d||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,n=e!==d&&(r===d||i);i&&this.element.removeEventListener(this.name,this,r),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,a;typeof this._$AH=="function"?this._$AH.call((a=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&a!==void 0?a:this.element,e):this._$AH.handleEvent(e)}},ie=class{constructor(e,t,a){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=a}get _$AU(){return this._$AM._$AU}_$AI(e){C(this,e)}};var we=U.litHtmlPolyfillSupport;we?.(T,I),((Y=U.litHtmlVersions)!==null&&Y!==void 0?Y:U.litHtmlVersions=[]).push("2.8.0");var Ce=(o,e,t)=>{var a,r;let i=(a=t?.renderBefore)!==null&&a!==void 0?a:e,n=i._$litPart$;if(n===void 0){let c=(r=t?.renderBefore)!==null&&r!==void 0?r:null;i._$litPart$=n=new I(e.insertBefore(E(),c),c,void 0,t??{})}return n._$AI(o),n};var ne,oe;var w=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;let a=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=a.firstChild),a}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ce(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return _}};w.finalized=!0,w._$litElement$=!0,(ne=globalThis.litElementHydrateSupport)===null||ne===void 0||ne.call(globalThis,{LitElement:w});var Le=globalThis.litElementPolyfillSupport;Le?.({LitElement:w});((oe=globalThis.litElementVersions)!==null&&oe!==void 0?oe:globalThis.litElementVersions=[]).push("3.3.3");var ze={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Me=o=>(...e)=>({_$litDirective$:o,values:e}),F=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,a){this._$Ct=e,this._$AM=t,this._$Ci=a}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};var D=class extends F{constructor(e){if(super(e),this.et=d,e.type!==ze.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===d||e==null)return this.ft=void 0,this.et=e;if(e===_)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.et)return this.ft;this.et=e;let t=[e];return t.raw=t,this.ft={_$litType$:this.constructor.resultType,strings:t,values:[]}}};D.directiveName="unsafeHTML",D.resultType=1;var Ee=Me(D);var qe="auchan_grocery",g="/api/auchan_grocery",Ue=350,Fe={cart:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.925-7.125a60.914 60.914 0 0 0-18.786-1.002c-.355-.013-.704.015-1.05.04A3.75 3.75 0 0 0 3.636 8.25M7.5 14.25 5.106 5.272M7.5 14.25l-1.5 1.5M18 18.75a3 3 0 0 1-3-3m0 0a3 3 0 0 1-3-3m3 3h.008v.008H15v-.008Z"/></svg>',search:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>',map:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/></svg>',recipes:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.872c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5M3.75 13.121c.626-2.562 2.99-4.372 5.752-4.372h5c2.762 0 5.126 1.81 5.752 4.372m-3.752.13v4.5m-9.25-4.5v4.5M12 21v-4.5m-3.75 4.5h7.5"/></svg>',dashboard:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>',pin:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>',starFill:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>',xmark:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>',chevron:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>',alert:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>',clipboard:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/></svg>',arrowUp:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"/></svg>',wrench:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>',refresh:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>',chevronLeft:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',qr:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75V4.5Zm11.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75h-3.75a.75.75 0 0 1-.75-.75V4.5Zm-11.25 11.25A.75.75 0 0 1 4.5 15h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75v-3.75ZM15 15h2.25v2.25H15V15Zm3.75 0h1.5v5.25h-5.25v-1.5h3.75V15Z"/></svg>'};function h(o,e=20){return s`<span class="icon" style="width:${e}px;height:${e}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${Ee(Fe[o]||"")}</span>`}function Pe(o,e){let t,a=(...r)=>{clearTimeout(t),t=setTimeout(()=>o(...r),e)};return a.cancel=()=>clearTimeout(t),a}function A(o){return!o||o===0?"\u2014":Number(o).toFixed(2)+" RON"}function Ve(o){return{available:{color:"var(--action)",label:"\xCEn stoc"},withoutStock:{color:"var(--brand)",label:"Epuizat"},withoutPriceFulfillment:{color:"var(--brand)",label:"Indisponibil"},withoutSearchSelection:{color:"var(--amber-deep)",label:"Indisponibil \xEEn zon\u0103"},cannotBeHandled:{color:"var(--amber-deep)",label:"Indisponibil \xEEn zon\u0103"}}[o]||{color:"var(--text-3)",label:o||"Necunoscut"}}var Te=N`
  --bg:        #071726;
  --surface:   #0E2338;
  --surface-2: rgba(214, 225, 236, 0.07);
  --surface-3: rgba(214, 225, 236, 0.14);
  --text:      #F2F7FB;
  --text-2:    #A9C0D4;
  --text-3:    #7E9AB2;
  --text-mute: #7E9AB2;
  --sep:       rgba(214, 225, 236, 0.16);
  --sep-strong:rgba(214, 225, 236, 0.26);
  --brand-tint:  rgba(237, 0, 46, 0.20);
  --red-tint:    rgba(237, 0, 46, 0.20);
  --action-tint: rgba(0, 172, 108, 0.16);
  --green-tint:  rgba(0, 172, 108, 0.16);
  --blue-tint:   rgba(63, 169, 245, 0.16);
  --amber-deep:  var(--amber);
  --sh-md: 0 4px 16px rgba(0, 0, 0, .45);
  --sh-lg: 0 16px 40px rgba(0, 0, 0, .60);
  --card-border: 1px solid rgba(214, 225, 236, 0.12);
`,Qe="/auchan_grocery_static/vendor/qrcode.min.js";async function Ge(o){return new Promise((e,t)=>{if(document.querySelector(`script[src="${o}"]`)){e();return}let a=document.createElement("script");a.src=o,a.onload=e,a.onerror=t,document.head.appendChild(a)})}var le=class{constructor(e){this._hass=e}async _request(e,t,a){let r=t.replace(/^\/api\//,"");return this._hass.callApi(e,r,a)}async callService(e,t={}){return this._hass.callService(qe,e,t)}async getLists(){return this._request("GET",`${g}/lists`)}async search(e,t){return this._request("GET",`${g}/search?q=${encodeURIComponent(e)}&list_id=${encodeURIComponent(t||"")}`)}async getPickupPoints(e,t){return this._request("GET",`${g}/pickup?lat=${e}&lng=${t}`)}async getRecipes(){return this._request("GET",`${g}/recipes`)}async getChefStatus(){return this._request("GET",`${g}/chef/status`)}async startChefLogin(){return this._request("POST",`${g}/chef/login`,{})}async getChefLoginStatus(e){return this._request("GET",`${g}/chef/login/${encodeURIComponent(e)}`)}async logoutChef(){return this._request("POST",`${g}/chef/logout`,{})}async getChefPreferences(){return this._request("GET",`${g}/chef/preferences`)}async saveChefPreferences(e){return this._request("PUT",`${g}/chef/preferences`,e)}async createChefPlan(e,t=null){return this._request("POST",`${g}/chef/plan`,{prompt:e,thread_id:t||void 0})}async importChefProducts(e){return this._request("POST",`${g}/chef/import`,e)}async getAddresses(){return this._request("GET",`${g}/addresses`)}async addAddress(e,t,a,r,i=""){return this._request("POST",`${g}/addresses`,{label:e,display_name:t,latitude:a,longitude:r,postal_code:i,set_active:!0})}async deleteAddress(e){return await this._request("DELETE",`${g}/addresses/${encodeURIComponent(e)}`),!0}async activateAddress(e){return this._request("POST",`${g}/addresses/${encodeURIComponent(e)}/activate`,{})}async geocode(e){return this._request("GET",`${g}/geocode?q=${encodeURIComponent(e)}`)}async getRegionInfo(e=!1){return this._request("GET",`${g}/region${e?"?force=1":""}`)}async resolveRegion(e,t){return this._request("GET",`${g}/region_resolve?lat=${e}&lng=${t}`)}async getJson(e){return this._request("GET",e)}async postJson(e,t){return this._request("POST",e,t)}},ce=class{constructor(e){this._panel=e,this._resolve=null}async confirm(e,t=!1){return new Promise(a=>{this._resolve=a,this._panel._dialog={type:"confirm",message:e,destructive:t}})}async prompt(e,t=""){return new Promise(a=>{this._resolve=a,this._panel._dialog={type:"prompt",message:e,placeholder:t,value:""}})}respond(e){this._resolve&&(this._resolve(e),this._resolve=null,this._panel._dialog=null)}},R=class extends w{constructor(){super(),this._lists=[],this._activeListId=null,this._searchQuery="",this._searchResults=[],this._pickupPoints=[],this._addresses=[],this._loading=!0,this._searchLoading=!1,this._notification=null,this._showQr=!1,this._qrUrl="",this._tab="dashboard",this._api=null,this._recipes=[],this._recipesLoading=!1,this._showAddressModal=!1,this._showAddressSheet=!1,this._addrQuery="",this._addrSuggestions=[],this._addrLabel="Acas\u0103",this._addrSelected=null,this._addrLoading=!1,this._regionInfo=null,this._showDiagnostics=!1,this._dialog=null,this._dialogValue="",this._sortBy="added",this._filterCategory="",this._isMobile=window.innerWidth<768,this._searchDebounced=Pe(this._doSearch.bind(this),Ue),this._addrDebounced=Pe(this._doAddrSearch.bind(this),400),this._dialogMgr=new ce(this),this._pickupPointsLoading=!1,this._busyActions={},this._recipeModalData=null,this._recipeImportListId=null,this._chefStatus=null,this._chefStatusLoading=!1,this._chefLogin=null,this._chefPrompt="",this._chefPlan=null,this._chefThreadId="",this._chefSelected={},this._chefPreferences={household_size:2,budget:"mediu",max_time_minutes:45,dietary:[],dislikes:"",pantry:"",loyalty_card_alias:""},this._chefSettingsOpen=!1,this._chefGenerating=!1,this._chefImporting=!1,this._chefTargetListId="",this._timers=new Set,this._mapChannel=crypto.randomUUID(),this._resizeObserver=new ResizeObserver(e=>{this._isMobile=e[0].contentRect.width<768})}connectedCallback(){super.connectedCallback(),this._resizeObserver.observe(this),this._onMapMessage=this._handleMapMessage.bind(this),window.addEventListener("message",this._onMapMessage)}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver.disconnect(),window.removeEventListener("message",this._onMapMessage),this._searchDebounced.cancel(),this._addrDebounced.cancel(),this._timers.forEach(e=>clearTimeout(e)),this._timers.clear()}_schedule(e,t){let a=setTimeout(()=>{this._timers.delete(a),e()},t);return this._timers.add(a),a}async _runAction(e,t,a=""){if(this._busyActions[e])return null;this._busyActions={...this._busyActions,[e]:!0};try{let r=await t();return a&&this._showToast(a,"success"),r}catch(r){return console.error(`[AuchanPanel] ${e} failed`,r),this._showToast("Ac\u021Biunea nu a putut fi finalizat\u0103. \xCEncearc\u0103 din nou.","error"),null}finally{let{[e]:r,...i}=this._busyActions;this._busyActions=i}}async _handleMapMessage(e){let t=this.shadowRoot?.querySelector("#leaflet-iframe");if(e.source!==t?.contentWindow||e.data?.channel!==this._mapChannel)return;let{type:a,lat:r,lng:i,name:n}=e.data||{},c=Number(r),p=Number(i);if(!(!a||!Number.isFinite(c)||!Number.isFinite(p))&&!(c<43.5||c>48.3||p<20||p>30)){if(a==="map_click"){let l=await this._runAction("map-region",()=>this._api?.resolveRegion(c,p));if(!l||!l.all_sellers?.length){this._showToast("Niciun magazin Auchan g\u0103sit \xEEn aceast\u0103 zon\u0103","warning");return}let u=l.all_sellers.map(v=>({lat:c,lng:p,name:v.name||v.id,desc:v.id}));t?.contentWindow?.postMessage({type:"explore_stores",stores:u,channel:this._mapChannel},"*"),this._showToast(`${u.length} magazin(e) g\u0103site \xEEn zon\u0103`,"success")}if(a==="store_set_active"){let l=this._addresses.find(u=>Math.abs(u.latitude-c)<.001&&Math.abs(u.longitude-p)<.001);if(l){if(!await this._runAction(`map-address:${l.id}`,()=>this._api?.activateAddress(l.id)))return;await this._loadAddresses(),this._showToast(`${n||"Magazin"} setat ca adres\u0103 activ\u0103 \u2713`,"success")}else{let u=n||"Adres\u0103 magazin";if(!await this._runAction("map-address:new",()=>this._api?.addAddress(u,n||"Magazin Auchan",c,p)))return;await this._loadAddresses(),this._showToast(`${u} setat ca adres\u0103 activ\u0103 \u2713`,"success")}}if(a==="store_save_new"){let l=await this._dialogMgr.prompt(`Etichet\u0103 pentru ${n||"magazin"}:`,n||"Magazin Auchan");if(!l||!await this._runAction("map-address:save",()=>this._api?.addAddress(l,n||"Magazin Auchan",c,p)))return;await this._loadAddresses(),this._showToast(`"${l}" salvat \u2713`,"success")}}}_syncTheme(){let e=this.hass?.themes?.darkMode;typeof e=="boolean"?(this.toggleAttribute("theme-known",!0),this.toggleAttribute("dark",e)):(this.removeAttribute("theme-known"),this.removeAttribute("dark"))}updated(e){let t=!1;e.has("hass")&&this._syncTheme(),e.has("hass")&&this.hass&&(this._api?this._api._hass=this.hass:(this._api=new le(this.hass),t=!0),t&&(this._loadData(),this._loadAddresses(),this._loadPickupPoints())),e.has("_tab")&&(this._tab==="map"&&this._pickupPoints.length===0&&this._loadPickupPoints(),this._tab==="recipes"&&!this._chefStatus&&this._loadChef())}async _loadData(){this._loading=!0;try{let e=await this._api?.getLists()||[];this._lists=e,e.some(t=>t.id===this._activeListId)||(this._activeListId=e.find(t=>t.is_active)?.id||e[0]?.id||null)}catch(e){console.error("[AuchanPanel] loadData:",e),this._showToast("Listele nu au putut fi \xEEnc\u0103rcate.","error")}this._loading=!1}async _loadAddresses(){if(this._api)try{this._addresses=await this._api.getAddresses()}catch(e){console.error("[AuchanPanel] addresses failed",e),this._showToast("Adresele nu au putut fi \xEEnc\u0103rcate.","error")}}async _loadPickupPoints(){if(!this._api)return;this._pickupPointsLoading=!0;let e=this._addresses?.find(r=>r.is_active),t=e?.latitude||this.hass?.config?.latitude||44.4195,a=e?.longitude||this.hass?.config?.longitude||26.1776;try{this._pickupPoints=await this._api.getPickupPoints(t,a)}catch(r){console.error("[AuchanPanel] pickup points failed",r),this._showToast("Magazinele nu au putut fi \xEEnc\u0103rcate.","error")}this._pickupPointsLoading=!1}async _loadRecipes(){if(this._api){this._recipesLoading=!0;try{this._recipes=await this._api.getRecipes()}catch(e){console.error("[AuchanPanel] recipes failed",e),this._showToast("Re\u021Betele nu au putut fi \xEEnc\u0103rcate.","error")}this._recipesLoading=!1}}async _loadChef(){if(!this._api||this._chefStatusLoading)return;this._chefStatusLoading=!0;let[e,t]=await Promise.allSettled([this._api.getChefStatus(),this._api.getChefPreferences()]);e.status==="fulfilled"?this._chefStatus=e.value:(console.error("[AuchanPanel] chef status failed",e.reason),this._chefStatus={configured:!0,connected:!1,error:"Serviciul Chef AI nu r\u0103spunde. Verific\u0103 adresa bridge-ului."}),t.status==="fulfilled"&&(this._chefPreferences={...this._chefPreferences,...t.value}),this._chefTargetListId||(this._chefTargetListId=this._activeListId||"new"),this._chefStatusLoading=!1}async _loadLists(){await this._loadData()}_onSearchInput(e){this._searchQuery=e.target.value,this._searchQuery.length>=2?this._searchDebounced():this._searchResults=[]}async _doSearch(){if(!(!this._api||!this._searchQuery||this._searchQuery.length<2)){this._searchLoading=!0;try{this._searchResults=await this._api.search(this._searchQuery,this._activeListId)}catch(e){console.error("[AuchanPanel] search failed",e),this._searchResults=[],this._showToast("C\u0103utarea nu este disponibil\u0103 momentan.","error")}this._searchLoading=!1}}_clearSearch(){this._searchQuery="",this._searchResults=[];let e=this.shadowRoot?.querySelector("#search-input");e&&(e.value="")}_openAddressModal(){if(this._isMobile){this._showAddressSheet=!0;return}this._showAddressModal=!0,this._addrQuery="",this._addrSuggestions=[],this._addrSelected=null,this._addrLabel="Acas\u0103"}_openAddAddressModal(){this._showAddressSheet=!1,this._showAddressModal=!0,this._addrQuery="",this._addrSuggestions=[],this._addrSelected=null,this._addrLabel="Acas\u0103"}_closeAddressModal(){this._showAddressModal=!1}_onAddrInput(e){this._addrQuery=e.target.value,this._addrSelected=null,this._addrQuery.length>=3?this._addrDebounced():this._addrSuggestions=[]}async _doAddrSearch(){!this._api||this._addrQuery.length<3||(this._addrLoading=!0,this._addrSuggestions=await this._api.geocode(this._addrQuery).catch(()=>[]),this._addrLoading=!1)}_selectAddrSuggestion(e){this._addrSelected=e,this._addrQuery=e.display_name,this._addrSuggestions=[]}async _saveAddress(){if(!this._addrSelected||!this._api)return;this._addrLoading=!0;let e=null;try{e=await this._api.addAddress(this._addrLabel,this._addrSelected.display_name,this._addrSelected.latitude,this._addrSelected.longitude,this._addrSelected.postal_code||"")}catch(t){console.error("[AuchanPanel] address save failed",t)}finally{this._addrLoading=!1}e?(this._showToast(`Adres\u0103 "${this._addrLabel}" salvat\u0103!`,"success"),await this._loadAddresses(),this._closeAddressModal()):this._showToast("Eroare la salvarea adresei","error")}async _activateAddress(e){!this._api||!await this._runAction(`address:${e}`,()=>this._api.activateAddress(e))||(await this._loadAddresses(),await this._loadLists(),this._pickupPoints=[],this._regionInfo=await this._api.getRegionInfo(!0).catch(()=>null),this._showToast("Adres\u0103 activat\u0103! Se actualizeaz\u0103 stocurile...","info"),this._schedule(async()=>{await this._loadLists(),this._showToast("Stocuri actualizate pentru adresa selectat\u0103 \u2713","success")},7e3))}async _deleteAddress(e,t){!await this._dialogMgr.confirm(`\u0218tergi adresa "${t}"?`,!0)||!await this._runAction(`delete-address:${e}`,()=>this._api?.deleteAddress(e))||(await this._loadAddresses(),this._showToast("Adres\u0103 \u0219tears\u0103","info"))}async _addSearchResult(e){!this._activeListId||!this._api||await this._runAction(`add:${e.sku_id}`,()=>this._api.callService("add_item",{list_id:this._activeListId,sku_id:e.sku_id,product_id:e.product_id,name:e.name,brand:e.brand||"",quantity:1,price:e.price||0,list_price:e.list_price||0,image_url:e.image_url||"",category:e.category||"",url:e.url||"",description:e.description||"",seller_id:e.seller_id||"1"}),`"${e.name}" ad\u0103ugat \xEEn list\u0103!`)===null||(this._clearSearch(),await this._loadData())}async _toggleCart(e,t){await this._runAction(`cart:${e}:${t}`,()=>this._api?.callService("toggle_in_cart",{list_id:e,sku_id:t}))!==null&&await this._loadData()}async _toggleWatch(e,t){await this._runAction(`watch:${e}:${t}`,()=>this._api?.callService("toggle_watch",{list_id:e,sku_id:t}))!==null&&await this._loadData()}async _removeItem(e,t,a){!await this._dialogMgr.confirm(`Elimini "${a}" din list\u0103?`,!0)||await this._runAction(`remove:${e}:${t}`,()=>this._api?.callService("remove_item",{list_id:e,sku_id:t}))===null||await this._loadData()}async _updateQty(e,t,a,r){let i=Math.max(0,r+a);await this._runAction(`quantity:${e}:${t}`,()=>this._api?.callService("set_item_quantity",{list_id:e,sku_id:t,quantity:i}))!==null&&(i===0&&this._showToast("Produs eliminat din list\u0103","info"),await this._loadData())}async _createList(){let e=await this._dialogMgr.prompt("Nume list\u0103 nou\u0103:","ex: Cump\u0103r\u0103turi S\u0103pt\u0103m\xE2n\u0103");if(e===null)return;let t=(e||"").trim()||"Lista "+new Date().toLocaleDateString("ro-RO");await this._runAction("create-list",()=>this._api?.callService("create_list",{name:t}),`Lista "${t}" creat\u0103!`)!==null&&await this._loadData()}async _generateCartLink(){let e=this._activeList;if(!e)return;let t=(e.items||[]).filter(i=>i.in_cart!==!1);if(t.length===0){this._showToast("Bifeaz\u0103 cel pu\u021Bin un produs pentru co\u0219.","warning");return}let a=new URLSearchParams;for(let i of t)a.append("sku",i.sku_id),a.append("qty",String(i.quantity||1)),a.append("seller",i.seller_id||"1");a.set("sc","1");let r=`https://www.auchan.ro/checkout/cart/add?${a.toString()}`;this._qrUrl=r,this._showQr=!0,await this._renderQr(r)}async _renderQr(e){await Ge(Qe),await this.updateComplete;let t=this.shadowRoot?.querySelector("#qr-container");if(t){t.innerHTML="";try{new window.QRCode(t,{text:e,width:200,height:200,colorDark:"#000000",colorLight:"#ffffff",correctLevel:window.QRCode.CorrectLevel.M})}catch{t.textContent=e}}}async _addRecipeIngredients(e){if(!this._activeListId||!e.ingredients?.length)return;let t=0,a=0;for(let r of e.ingredients)if(r.name){try{await this._api.callService("search_and_add",{list_id:this._activeListId,query:r.name,quantity:1,auto_add_first:!0}),t++}catch(i){a++,console.error("[AuchanPanel] ingredient import failed",i)}if(t+a>=10)break}this._showToast(a?`${t} ingrediente ad\u0103ugate, ${a} nu au putut fi ad\u0103ugate.`:`${t} ingrediente din "${e.title}" ad\u0103ugate!`,a?"warning":"success"),await this._loadData()}async _selectPickupStore(e){if(!this._api)return;let t=`Magazin ${e.name}`,a=[e.address,e.city].filter(Boolean).join(" \xB7 ");await this._runAction(`pickup-address:${e.id||e.name}`,()=>this._api.addAddress(t,a,e.latitude,e.longitude,e.postal_code||""))&&(await this._loadAddresses(),this._showToast(`Setat ca loca\u021Bie: ${e.name}`,"success"),this._tab="list")}_flyToStore(e){if(!e.latitude||!e.longitude)return;let t=this.shadowRoot?.querySelector("#leaflet-iframe");t?.contentWindow&&t.contentWindow.postMessage({type:"fly",lat:e.latitude,lng:e.longitude,channel:this._mapChannel},"*")}_showToast(e,t="info"){this._notification={message:e,type:t},this._schedule(()=>{this._notification=null},3500)}async _selectList(e){if(!e||e===this._activeListId)return;let t=this._activeListId;this._activeListId=e,this._filterCategory="",await this._runAction("select-list",()=>this._api?.callService("set_active_list",{list_id:e}))===null&&(this._activeListId=t)}_renderDialog(){if(!this._dialog)return d;let e=this._dialog;return s`
      <div class="dialog-overlay" @click=${()=>this._dialogMgr.respond(null)}>
        <div class="dialog-sheet" @click=${t=>t.stopPropagation()}>
          <p class="dialog-message">${e.message}</p>
          ${e.type==="prompt"?s`
            <input class="dialog-input" type="text"
              placeholder=${e.placeholder||""}
              .value=${this._dialogValue}
              @input=${t=>this._dialogValue=t.target.value}
              @keydown=${t=>t.key==="Enter"&&this._dialogMgr.respond(this._dialogValue)}
              autofocus />
          `:d}
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn--cancel" @click=${()=>{this._dialogValue="",this._dialogMgr.respond(null)}}>
              Anulează
            </button>
            <button class="dialog-btn ${e.destructive?"dialog-btn--danger":"dialog-btn--confirm"}"
              @click=${()=>{let t=e.type==="prompt"?this._dialogValue||"":!0;this._dialogValue="",this._dialogMgr.respond(t)}}>
              ${e.type==="prompt"?"Salveaz\u0103":e.destructive?"\u0218terge":"OK"}
            </button>
          </div>
        </div>
      </div>
    `}get _activeList(){let e=this._lists||[];return e.find(t=>t.id===this._activeListId)||e[0]||null}get _activeItems(){let e=[...this._activeList?.items||[]];switch(this._filterCategory&&(e=e.filter(t=>t.category===this._filterCategory)),this._sortBy){case"price_asc":return e.sort((t,a)=>(t.current_price||0)-(a.current_price||0));case"price_desc":return e.sort((t,a)=>(a.current_price||0)-(t.current_price||0));case"name":return e.sort((t,a)=>(t.name||"").localeCompare(a.name||""));default:return e}}get _categories(){return[...new Set((this._activeList?.items||[]).map(t=>t.category).filter(Boolean))]}get _cartTotal(){return(this._activeList?.items||[]).filter(e=>e.in_cart!==!1).reduce((e,t)=>e+(t.current_price||t.price_when_added||0)*(t.quantity||1),0)}get _cartSavings(){return(this._activeList?.items||[]).filter(e=>e.in_cart!==!1&&e.list_price>e.current_price).reduce((e,t)=>e+(t.list_price-t.current_price)*(t.quantity||1),0)}render(){let e=!this._isMobile;return s`
      ${this._renderToast()}
      ${this._renderDialog()}
      <div class="panel-root ${e?"panel-root--desktop":""}">
        ${this._renderHeader()}
        <div class="search-wrap">
          ${this._renderSearch()}
          ${this._renderSearchResults()}
        </div>
        ${e?s`
          <div class="desktop-layout">
            <aside class="sidebar">${this._renderSidebar()}</aside>
            <main class="main-content">
              ${this._renderTabs()}
              <div class="tab-content">${this._renderActiveTab()}</div>
              ${this._renderActionBar()}
            </main>
          </div>
        `:s`
          <div class="tab-content">${this._renderActiveTab()}</div>
          ${this._renderActionBar()}
          ${this._renderMobileBottomNav()}
        `}
        ${this._showQr?this._renderQrModal():d}
        ${this._showAddressModal?this._renderAddressModal():d}
        ${this._showAddressSheet?this._renderAddressSheet():d}
      </div>
    `}_renderActiveTab(){switch(this._tab){case"dashboard":return this._renderDashboardView();case"list":return this._renderListView();case"map":return this._renderMapView();case"recipes":return this._renderRecipesView()}}_renderToast(){if(!this._notification)return d;let{message:e,type:t}=this._notification;return s`<div class="toast toast--${t}" role="alert">${e}</div>`}_renderHeader(){let e=this._addresses||[],t=this._lists||[],r=e.find(n=>n.is_active)?.label||"F\u0103r\u0103 adres\u0103",i=this._activeList;return s`
      <header class="panel-header" role="banner">
        <!-- HA Home / Back button -->
        <button class="hdr-home-btn"
          @click=${()=>{window.history.length>1?window.history.back():window.location.href="/"}}
          title="Înapoi la tabloul de bord HA"
          aria-label="Înapoi la tabloul de bord Home Assistant">
          ${h("home",18)}
        </button>

        <!-- Brand -->
        <div class="header-brand" aria-label="Auchan Grocery">
          <div class="brand-icon">${h("cart",16)}</div>
          <span class="brand-name">Auchan <small>Grocery</small></span>
        </div>

        <!-- Address pill -->
        <button class="header-pill" @click=${this._openAddressModal}
          title="Gestionează adrese"
          aria-label="Adresă activă: ${r}">
          ${h("pin",13)}
          <span class="pill-label">${r}</span>
          ${h("chevron",10)}
        </button>

        <!-- List selector -->
        <div class="header-list-wrap">
          ${h("list",13)}
          <select class="header-select"
            @change=${n=>this._selectList(n.target.value)}
            aria-label="Listă activă">
            ${t.map(n=>s`
              <option value=${n.id} ?selected=${n.id===this._activeListId}>${n.name||n.id}</option>
            `)}
          </select>
        </div>

        <!-- Right actions -->
        <div class="header-actions">
          <button class="hdr-btn" @click=${this._createList}
            title="Listă nouă" aria-label="Crează listă nouă">
            ${h("plus",16)}
          </button>
          <button class="hdr-btn hdr-btn--diag ${this._showDiagnostics?"hdr-btn--active":""}"
            @click=${()=>{this._showDiagnostics=!this._showDiagnostics,this._showDiagnostics&&!this._regionInfo&&this._api?.getRegionInfo().then(n=>this._regionInfo=n)}}
            title="Diagnostice" aria-label="Diagnostice">
            ${h("wrench",15)}
          </button>
        </div>
      </header>
      ${this._showDiagnostics?this._renderDiagnostics():d}
    `}_renderDiagnostics(){let e=this._regionInfo,t=this._addresses?.find(r=>r.is_active),a=t?.region_id||e?.region_id;return s`
      <div class="diagnostics">
        <div class="diag-row">
          <span class="diag-label">Region ID</span>
          <code class="diag-val ${a?"":"diag-val--missing"}">
            ${a||"\u274C lips\u0103 \u2014 apas\u0103 \u21BA Refresh"}
          </code>
        </div>
        <div class="diag-row">
          <span class="diag-label">Adresă activă</span>
          <code class="diag-val">${t?.display_name||e?.address?.display_name||"\u2014"}</code>
        </div>
        <div class="diag-row">
          <span class="diag-label">Seller</span>
          <code class="diag-val">${t?.seller_id||"\u2014"}</code>
        </div>
        <button class="diag-refresh-btn" @click=${async()=>{this._regionInfo=await this._api?.getRegionInfo(!0).catch(()=>null),await this._loadAddresses()}}>
          ↺ Refresh Region
        </button>
      </div>
    `}_renderSearch(){return s`
      <div class="search-bar" role="search">
        <span class="search-icon">${h("search",18)}</span>
        <input
          id="search-input"
          class="search-input"
          type="search"
          placeholder="Caută produse Auchan..."
          .value=${this._searchQuery}
          @input=${this._onSearchInput}
          @keydown=${e=>e.key==="Escape"&&this._clearSearch()}
          autocomplete="off"
          aria-label="Caută produse"
        />
        ${this._searchLoading?s`<div class="spinner" aria-label="Se caută..."></div>`:d}
        ${this._searchQuery?s`
          <button class="search-clear" @click=${this._clearSearch} aria-label="Șterge căutarea">
            ${h("xmark",16)}
          </button>
        `:d}
      </div>
    `}_renderSearchResults(){return!this._searchResults?.length&&!this._searchLoading?d:this._searchLoading&&!this._searchResults?.length?s`
        <div class="search-results">
          ${[1,2,3].map(()=>s`<div class="search-skeleton"></div>`)}
        </div>
      `:s`
      <div class="search-results" role="list" aria-label="Rezultate căutare">
        ${this._searchResults.map(e=>s`
          <div class="search-row" role="listitem">
            ${e.image_url?s`
              <img class="search-thumb" src=${e.image_url} alt="" loading="lazy" referrerpolicy="no-referrer"
                   @error=${t=>t.target.style.display="none"} />
            `:s`<div class="search-thumb search-thumb--placeholder"></div>`}
            <div class="search-info">
              <span class="search-name">${e.name}</span>
              ${e.brand?s`<span class="search-brand">${e.brand}</span>`:d}
            </div>
            <div class="search-price-col">
              <span class="search-price">${A(e.price)}</span>
              ${e.discount_pct>0?s`<span class="search-discount">-${e.discount_pct}%</span>`:d}
            </div>
            <button class="search-add-btn" aria-label="Adaugă ${e.name}"
              ?disabled=${!!this._busyActions[`add:${e.sku_id}`]}
              @click=${()=>this._addSearchResult(e)}>
              ${this._busyActions[`add:${e.sku_id}`]?s`<div class="spinner spinner--sm"></div>`:h("plus",16)}
            </button>
          </div>
        `)}
      </div>
    `}_renderSidebar(){let e=this._lists||[],t=this._addresses||[];return s`
      <nav class="sidebar-nav" aria-label="Navigare">
        <div class="sidebar-section">
          <h3 class="sidebar-heading">Liste</h3>
          ${e.map(a=>s`
            <button class="sidebar-item ${a.id===this._activeListId?"sidebar-item--active":""}"
              @click=${()=>this._selectList(a.id)}>
              ${h("list",16)}
              <span>${a.name||a.id}</span>
              <span class="sidebar-count">${a.item_count??a.items?.length??0}</span>
            </button>
          `)}
          <button class="sidebar-add-btn" @click=${this._createList}>
            ${h("plus",14)} Listă nouă
          </button>
        </div>
        <div class="sidebar-section">
          <h3 class="sidebar-heading">Adrese</h3>
          ${t.map(a=>s`
            <div class="sidebar-addr ${a.is_active?"sidebar-addr--active":""}">
              <button class="sidebar-addr-main" @click=${()=>this._activateAddress(a.id)}>
                ${h("pin",14)}
                <span>${a.label}</span>
                ${a.is_active?s`<span class="dot-active"></span>`:d}
              </button>
              <button class="sidebar-addr-del" @click=${()=>this._deleteAddress(a.id,a.label)}
                aria-label="Șterge adresa ${a.label}">
                ${h("trash",14)}
              </button>
            </div>
          `)}
          <button class="sidebar-add-btn" @click=${this._openAddressModal}>
            ${h("plus",14)} Adresă nouă
          </button>
        </div>
      </nav>
    `}_renderTabs(){return s`
      <nav class="tab-bar" role="tablist" aria-label="Secțiuni">
        ${[{id:"dashboard",icon:"dashboard",label:"Tablou"},{id:"list",icon:"list",label:"List\u0103"},{id:"map",icon:"map",label:"Hart\u0103"},{id:"recipes",icon:"recipes",label:"Chef AI"}].map(t=>s`
          <button
            class="tab ${this._tab===t.id?"tab--active":""}"
            role="tab"
            aria-selected=${this._tab===t.id}
            @click=${()=>{this._tab=t.id}}
            id="tab-${t.id}">
            ${h(t.icon,20)}
            <span class="tab-label">${t.label}</span>
          </button>
        `)}
      </nav>
    `}_renderMobileBottomNav(){return s`
      <nav class="mobile-bottom-nav" role="tablist" aria-label="Navigare">
        ${[{id:"dashboard",icon:"dashboard",label:"Tablou"},{id:"list",icon:"list",label:"List\u0103"},{id:"map",icon:"map",label:"Hart\u0103"},{id:"recipes",icon:"recipes",label:"Chef AI"}].map(t=>s`
          <button
            class="tab ${this._tab===t.id?"tab--active":""}"
            role="tab"
            aria-selected=${this._tab===t.id}
            @click=${()=>{this._tab=t.id}}
            id="mob-tab-${t.id}">
            ${h(t.icon,22)}
            <span class="tab-label">${t.label}</span>
          </button>
        `)}
      </nav>
    `}_renderDashboardView(){let e=this._activeList,t=e?.items||[],a=t.filter(l=>l.in_cart!==!1),r=t.filter(l=>{let u=l.availability;return!u||u==="withoutStock"||u==="withoutPriceFulfillment"||u==="withoutSearchSelection"||u==="cannotBeHandled"}),i=t.filter(l=>l.watch||l.watch_price||l.watch_stock),n=this._cartSavings,c={};t.forEach(l=>{l.category&&(c[l.category]=(c[l.category]||0)+1)});let p=Object.entries(c).sort((l,u)=>u[1]-l[1]).slice(0,4);return e?s`
      <div class="dash">
        <!-- Hero Card -->
        <div class="dash-hero">
          <div class="dash-hero-left">
            <h2 class="dash-list-name">${e.name||e.id}</h2>
          </div>
          <div class="dash-hero-right">
            <span class="dash-total-label">Total coș</span>
            <span class="dash-total-val">${A(this._cartTotal)}</span>
            ${n>.01?s`
              <span class="dash-chip dash-chip--green">Economii ${A(n)}</span>
            `:d}
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="bento">
          <button class="bento-card stat-card" @click=${()=>{this._tab="list",this._filterCategory=""}}>
            <div class="stat-icon stat-icon--blue">${h("list",22)}</div>
            <div class="stat-body">
              <span class="stat-num">${a.length}</span>
              <span class="stat-name">În coș</span>
            </div>
          </button>

          <button class="bento-card stat-card" @click=${()=>this._tab="list"}>
            <div class="stat-icon stat-icon--orange">${h("eye",22)}</div>
            <div class="stat-body">
              <span class="stat-num">${i.length}</span>
              <span class="stat-name">Monitorizate</span>
            </div>
          </button>

          <button class="bento-card stat-card ${r.length>0?"stat-card--alert":""}"
            @click=${()=>this._tab="list"}>
            <div class="stat-icon stat-icon--red">${h("alert",22)}</div>
            <div class="stat-body">
              <span class="stat-num">${r.length}</span>
              <span class="stat-name">Epuizate</span>
            </div>
          </button>

          <button class="bento-card stat-card" @click=${()=>this._tab="map"}>
            <div class="stat-icon stat-icon--green">${h("pin",22)}</div>
            <div class="stat-body">
              <span class="stat-num">${this._pickupPoints.length||"\u2014"}</span>
              <span class="stat-name">Magazine</span>
            </div>
          </button>
        </div>

        <!-- Categories -->
        ${p.length>0?s`
          <div class="bento-card">
            <h4 class="card-section-title">Categorii</h4>
            ${p.map(([l,u])=>s`
              <button class="cat-row" @click=${()=>{this._tab="list",this._filterCategory=l}}>
                <span class="cat-name">${l}</span>
                <span class="cat-badge">${u}</span>
              </button>
            `)}
          </div>
        `:d}
      </div>
    `:s`
      <div class="empty-state">
        ${h("list",48)}
        <h3>Nicio listă</h3>
        <p>Creează o listă nouă pentru a începe</p>
        <button class="primary-btn" @click=${this._createList}>${h("plus",16)} Listă nouă</button>
      </div>
    `}_renderListView(){if(this._loading)return this._renderSkeleton();let e=this._activeItems,t=this._categories;return s`
      <div class="list-view">
        <!-- Filters row -->
        <div class="filter-bar">
          <div class="filter-chips">
            <button class="filter-chip ${this._filterCategory?"":"filter-chip--active"}"
              @click=${()=>this._filterCategory=""}>
              Toate (${this._activeList?.items?.length||0})
            </button>
            ${t.map(a=>s`
              <button class="filter-chip ${this._filterCategory===a?"filter-chip--active":""}"
                @click=${()=>this._filterCategory=a}>
                ${a}
              </button>
            `)}
          </div>
          <select class="sort-select" @change=${a=>this._sortBy=a.target.value} aria-label="Sortare">
            <option value="added">Ordine adăugare</option>
            <option value="name">Alfabetic</option>
            <option value="price_asc">Preț crescător</option>
            <option value="price_desc">Preț descrescător</option>
          </select>
        </div>

        <!-- Product list -->
        ${e.length===0?s`
          <div class="empty-state">
            ${h("cart",48)}
            <h3>Lista e goală</h3>
            <p>Caută produse în bara de sus pentru a le adăuga</p>
          </div>
        `:s`
          <ul class="product-list" role="list">
            ${e.map(a=>this._renderProductCard(a))}
          </ul>
        `}
      </div>
    `}_renderSkeleton(){return s`
      <div class="product-list">
        ${[1,2,3,4].map(()=>s`
          <div class="product-card skeleton-card" aria-hidden="true">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton-body">
              <div class="skeleton skeleton-line skeleton-line--short"></div>
              <div class="skeleton skeleton-line"></div>
              <div class="skeleton skeleton-line skeleton-line--med"></div>
            </div>
          </div>
        `)}
      </div>
    `}_renderProductCard(e){let t=Ve(e.availability),a=e.in_cart!==!1,r=e.watch||e.watch_price||e.watch_stock,i=e.discount_pct||0,n=this._activeListId;return s`
      <li class="product-card ${a?"":"product-card--unchecked"} ${e.availability!=="available"?"product-card--unavail":""}"
          role="listitem">
        <!-- Left: Image -->
        <div class="prod-thumb-wrap">
          ${e.image_url?s`
            <img class="prod-thumb" src=${e.image_url} alt=${e.name} loading="lazy" referrerpolicy="no-referrer"
                 @error=${c=>c.target.style.display="none"} />
          `:s`<div class="prod-thumb prod-thumb--fallback">${h("cart",24)}</div>`}
          ${i>0&&e.availability==="available"?s`<span class="discount-badge">-${Math.round(i)}%</span>`:d}
        </div>

        <!-- Right: Body -->
        <div class="prod-body">
          <div class="prod-top">
            ${e.brand?s`<span class="prod-brand">${e.brand}</span>`:d}
            <div class="prod-actions">
              <button class="icon-btn ${r?"icon-btn--watch-active":""}"
                @click=${()=>this._toggleWatch(n,e.sku_id)}
                ?disabled=${!!this._busyActions[`watch:${n}:${e.sku_id}`]}
                aria-label="${r?"Dezactiveaz\u0103 monitorizare":"Monitorizeaz\u0103 pre\u021B/stoc"}"
                title="${r?"Monitorizare activ\u0103":"Monitorizeaz\u0103"}">
                ${h(r?"starFill":"star",17)}
              </button>
              <button class="icon-btn icon-btn--danger"
                @click=${()=>this._removeItem(n,e.sku_id,e.name)}
                ?disabled=${!!this._busyActions[`remove:${n}:${e.sku_id}`]}
                aria-label="Elimină ${e.name}">
                ${h("trash",17)}
              </button>
            </div>
          </div>

          <p class="prod-name">
            ${e.url?s`<a href=${e.url} target="_blank" rel="noopener">${e.name}</a>`:e.name}
          </p>

          <!-- Availability -->
          <div class="prod-avail">
            <span class="avail-dot" style="background:${t.color}"></span>
            <span class="avail-label" style="color:${t.color}">${t.label}</span>
          </div>

          <!-- Footer: price + controls -->
          <div class="prod-footer">
            <div class="price-block">
              ${e.list_price>0&&e.list_price!==e.current_price?s`
                <span class="price-original">${A(e.list_price)}</span>
              `:d}
              <span class="price-current">${A(e.current_price||e.price_when_added)}</span>
            </div>
            <div class="prod-controls">
              <div class="qty-control">
                <button class="qty-btn" @click=${()=>this._updateQty(n,e.sku_id,-1,e.quantity||1)}
                  ?disabled=${!!this._busyActions[`quantity:${n}:${e.sku_id}`]}
                  aria-label="Scade cantitate">−</button>
                <span class="qty-val" aria-label="Cantitate: ${e.quantity||1}">${e.quantity||1}</span>
                <button class="qty-btn" @click=${()=>this._updateQty(n,e.sku_id,1,e.quantity||1)}
                  ?disabled=${!!this._busyActions[`quantity:${n}:${e.sku_id}`]}
                  aria-label="Crește cantitate">+</button>
              </div>
              <button class="cart-toggle-btn ${a?"cart-toggle-btn--active":""}"
                @click=${()=>this._toggleCart(n,e.sku_id)}
                ?disabled=${!!this._busyActions[`cart:${n}:${e.sku_id}`]}
                aria-label="${a?"Scoate din co\u0219":"Adaug\u0103 \xEEn co\u0219"}"
                aria-pressed=${a}>
                ${a?"\xCEn co\u0219":"Adaug\u0103"}
              </button>
            </div>
          </div>
        </div>
      </li>
    `}_renderMapView(){let e=this._addresses?.find(c=>c.is_active),t=e?.latitude||this.hass?.config?.latitude||44.4195,a=e?.longitude||this.hass?.config?.longitude||26.1776,r=this._pickupPoints||[],i=this._pickupPointsLoading,n=this._buildMapHtml(t,a,r);return s`
      <div class="map-view">
        <iframe
          id="leaflet-iframe"
          class="leaflet-iframe"
          srcdoc=${n}
          sandbox="allow-scripts"
          title="Hartă magazine Auchan"
          loading="lazy">
        </iframe>

        <div class="map-stores-header">
          <h3 class="section-heading">
            ${i?"Se caut\u0103 magazine...":`Magazine aproape (${r.length})`}
          </h3>
          <button class="icon-btn" @click=${()=>this._loadPickupPoints()}
            title="Reîncarcă magazine" aria-label="Reîncarcă magazine">
            ${h("refresh",16)}
          </button>
        </div>

        ${i?s`
          <div class="pickup-skeleton">
            ${[1,2,3].map(()=>s`<div class="skeleton pickup-skel-row"></div>`)}
          </div>
        `:r.length>0?s`
          <ul class="pickup-list" role="list">
            ${r.map((c,p)=>s`
              <li class="pickup-item ${p===0?"pickup-item--best":""}" role="listitem">
                <div class="pickup-icon">${h("pin",20)}</div>
                <div class="pickup-info">
                  <span class="pickup-name">${c.name}</span>
                  <span class="pickup-addr">${c.address?`${c.address}, `:""}${c.city||""}</span>
                </div>
                <div class="pickup-right">
                  ${c.distance_km?s`<span class="pickup-dist">${c.distance_km.toFixed(1)} km</span>`:d}
                  <button class="icon-btn" @click=${()=>this._flyToStore(c)} title="Centrare pe hartă" aria-label="Centrează ${c.name}">
                    ${h("map",16)}
                  </button>
                  <button class="icon-btn" @click=${()=>this._selectPickupStore(c)} title="Selectează magazin" aria-label="Selectează ${c.name}">
                    ${h("check",16)}
                  </button>
                </div>
              </li>
            `)}
          </ul>
        `:s`
          <div class="empty-state">
            ${h("map",48)}
            <p>Nu s-au găsit magazine Auchan în zonă.</p>
            <button class="primary-btn" @click=${()=>this._loadPickupPoints()}>
              ${h("refresh",16)} Reîncarcă
            </button>
          </div>
        `}
      </div>
    `}_buildMapHtml(e,t,a){let r=v=>JSON.stringify(v).replaceAll("<","\\u003c").replaceAll("\u2028","\\u2028").replaceAll("\u2029","\\u2029"),i=r(a.map(v=>({lat:Number(v.latitude),lng:Number(v.longitude),name:String(v.name||"Magazin Auchan").slice(0,120),desc:[v.address,v.city].filter(Boolean).join(", ").slice(0,220)}))),n=r(this._mapChannel),c=window.location.origin,p=`${c}/auchan_grocery_static/vendor/leaflet.css`,l=`${c}/auchan_grocery_static/vendor/leaflet.js`,u=r(`${c}/auchan_grocery_static/images/auchan-marker.svg`);return`<!DOCTYPE html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' ${c}; style-src 'unsafe-inline' ${c}; img-src data: ${c} https://tile.openstreetmap.org; connect-src 'none'">
<link rel="stylesheet" href="${p}"/>
<script src="${l}"><\/script>
<style>
body{margin:0;font-family:system-ui,sans-serif}#map{width:100vw;height:100vh}
.auchan-pin{width:34px;height:34px;display:grid;place-items:center;background:#fff;border:2px solid #ED002E;border-radius:50% 50% 50% 5px;box-shadow:0 4px 12px rgba(1,23,42,.30);transform:rotate(-45deg)}
.auchan-pin img{width:23px;height:23px;display:block;transform:rotate(45deg)}
.auchan-pin--explore{border-color:#3FA9F5;box-shadow:0 4px 12px rgba(63,169,245,.36)}
.store-popup{min-width:180px}.store-popup b{display:block;margin-bottom:4px}.store-popup .addr{font-size:12px;color:#3C617E;margin-bottom:8px}.store-popup button{border-radius:6px;padding:7px 10px;cursor:pointer;font-size:12px;font-weight:700;width:100%;margin-top:4px}
</style></head>
<body><div id="map"></div><script>
const CHANNEL=${n};
const AUCHAN_MARKER=${u};
const map=L.map('map').setView([${e},${t}],12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'\xA9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  maxZoom:19
}).addTo(map);
const uIcon=L.divIcon({html:'<div style="background:#ED002E;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.4)"></div>',className:''});
const markerHtml=variant=>'<div class="auchan-pin '+(variant==='explore'?'auchan-pin--explore':'')+'"><img src="'+AUCHAN_MARKER+'" alt="" /></div>';
const sIcon=L.divIcon({html:markerHtml('store'),className:'',iconSize:[38,44],iconAnchor:[19,42],popupAnchor:[0,-38]});
const exploreIcon=L.divIcon({html:markerHtml('explore'),className:'',iconSize:[38,44],iconAnchor:[19,42],popupAnchor:[0,-38]});
L.marker([${e},${t}],{icon:uIcon}).addTo(map).bindPopup('Loca\u021Bia ta');
function send(type,p){window.parent.postMessage({type,lat:p.lat,lng:p.lng,name:p.name,channel:CHANNEL},'*');}
function popupFor(p,color){
  const root=document.createElement('div');root.className='store-popup';
  const title=document.createElement('b');title.textContent=p.name;root.append(title);
  const addr=document.createElement('div');addr.className='addr';addr.textContent=p.desc;root.append(addr);
  const active=document.createElement('button');active.textContent='\u2713 Seteaz\u0103 ca adres\u0103 activ\u0103';active.style.cssText='background:#00AC6C;color:white;border:none';active.addEventListener('click',()=>send('store_set_active',p));root.append(active);
  const save=document.createElement('button');save.textContent='+ Salveaz\u0103 ca adres\u0103 nou\u0103';save.style.cssText='background:white;color:'+color+';border:1px solid '+color;save.addEventListener('click',()=>send('store_save_new',p));root.append(save);
  return root;
}
${i}.forEach(p=>{if(Number.isFinite(p.lat)&&Number.isFinite(p.lng)){L.marker([p.lat,p.lng],{icon:sIcon}).addTo(map).bindPopup(popupFor(p,'#ED002E'))}});
let exploreMarkers=[];
function clearExplore(){exploreMarkers.forEach(m=>map.removeLayer(m));exploreMarkers=[];}
function addExploreStores(stores){stores.forEach(p=>{if(Number.isFinite(p.lat)&&Number.isFinite(p.lng)){const m=L.marker([p.lat,p.lng],{icon:exploreIcon}).addTo(map).bindPopup(popupFor(p,'#3FA9F5'));exploreMarkers.push(m)}});}
map.on('click',function(e){window.parent.postMessage({type:'map_click',lat:e.latlng.lat,lng:e.latlng.lng,channel:CHANNEL},'*');});
window.addEventListener('message',e=>{
  if(e.data?.channel!==CHANNEL)return;
  if(e.data?.type==='fly')map.flyTo([e.data.lat,e.data.lng],15);
  if(e.data?.type==='explore_stores'){clearExplore();addExploreStores(e.data.stores||[]);}
});
<\/script></body></html>`}async _startChefLogin(){try{this._chefLogin={status:"starting"};let e=await this._api.startChefLogin();this._chefLogin={...e,status:"pending"},e.login_id&&this._pollChefLogin(e.login_id,0)}catch(e){console.error("[AuchanPanel] Chef login failed",e),this._chefLogin=null,this._showToast("Autentificarea ChatGPT nu a putut fi pornit\u0103.","error")}}_pollChefLogin(e,t){!this._chefLogin||t>180||this._schedule(async()=>{try{let a=await this._api.getChefLoginStatus(e);if(this._chefLogin={...this._chefLogin,...a},a.status==="completed"){this._showToast("Contul ChatGPT a fost conectat.","success"),this._chefLogin=null,this._chefStatus=null,await this._loadChef();return}if(a.status==="failed"){this._showToast(a.error||"Autentificarea ChatGPT a e\u0219uat.","error");return}this._pollChefLogin(e,t+1)}catch(a){console.error("[AuchanPanel] Chef login polling failed",a),this._pollChefLogin(e,t+1)}},2e3)}async _logoutChef(){try{await this._api.logoutChef(),this._chefStatus=null,this._chefPlan=null,this._chefThreadId="",await this._loadChef(),this._showToast("Contul ChatGPT a fost deconectat.","success")}catch(e){console.error("[AuchanPanel] Chef logout failed",e),this._showToast("Contul nu a putut fi deconectat.","error")}}_setChefPreference(e,t){this._chefPreferences={...this._chefPreferences,[e]:t}}async _saveChefPreferences(){try{this._chefPreferences=await this._api.saveChefPreferences(this._chefPreferences),this._chefSettingsOpen=!1,this._showToast("Preferin\u021Bele au fost salvate.","success")}catch(e){console.error("[AuchanPanel] Chef preferences failed",e),this._showToast("Preferin\u021Bele nu au putut fi salvate.","error")}}async _askChef(e=this._chefPrompt){let t=String(e||"").trim();if(!(t.length<3||this._chefGenerating)){this._chefPrompt=t,this._chefGenerating=!0;try{let a=await this._api.createChefPlan(t,this._chefThreadId);this._chefPlan=a.recipe,this._chefThreadId=a.thread_id||this._chefThreadId;let r={};(a.recipe?.ingredients||[]).forEach((i,n)=>{let c=(i.matches||[]).find(p=>p.is_available)||i.matches?.[0];c?.sku_id&&(r[n]=c.sku_id)}),this._chefSelected=r}catch(a){console.error("[AuchanPanel] Chef generation failed",a),this._showToast("Chef AI nu a putut genera re\u021Beta. \xCEncearc\u0103 din nou.","error")}this._chefGenerating=!1}}_selectChefProduct(e,t){this._chefSelected={...this._chefSelected,[e]:t}}_skipChefProduct(e){let t={...this._chefSelected};delete t[e],this._chefSelected=t}async _importChefPlan(){if(!this._chefPlan||this._chefImporting)return;let e=(this._chefPlan.ingredients||[]).flatMap((t,a)=>{let r=this._chefSelected[a],i=(t.matches||[]).find(n=>n.sku_id===r);return i?[{ingredient_name:t.name,search_query:i.match_query||t.search_query,sku_id:i.sku_id,quantity:i.suggested_packages||1}]:[]});if(!e.length){this._showToast("Alege cel pu\u021Bin un produs.","error");return}this._chefImporting=!0;try{let t=await this._api.importChefProducts({list_id:this._chefTargetListId||this._activeListId||"new",recipe_title:this._chefPlan.title,selections:e});await this._loadLists(),t.list_id&&(this._activeListId=t.list_id);let a=t.rejected_count?`, ${t.rejected_count} respinse la reverificare`:"";this._showToast(`${t.added_count} produse ad\u0103ugate${a}.`,t.added_count?"success":"error"),t.added_count&&(this._tab="list")}catch(t){console.error("[AuchanPanel] Chef import failed",t),this._showToast("Produsele nu au putut fi importate.","error")}this._chefImporting=!1}_renderChefPreferences(){let e=this._chefPreferences;return s`
      <section class="chef-settings">
        <div class="chef-settings-grid">
          <label>Persoane
            <input type="number" min="1" max="20" .value=${String(e.household_size||2)}
              @input=${t=>this._setChefPreference("household_size",Number(t.target.value))} />
          </label>
          <label>Buget
            <select .value=${e.budget||"mediu"} @change=${t=>this._setChefPreference("budget",t.target.value)}>
              <option value="economic">Economic</option><option value="mediu">Mediu</option><option value="premium">Premium</option>
            </select>
          </label>
          <label>Timp maxim
            <select .value=${String(e.max_time_minutes||45)} @change=${t=>this._setChefPreference("max_time_minutes",Number(t.target.value))}>
              <option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option><option value="120">2 ore</option>
            </select>
          </label>
          <label>Regim / alergii
            <input .value=${(e.dietary||[]).join(", ")} placeholder="vegetarian, fără lactoză"
              @input=${t=>this._setChefPreference("dietary",t.target.value.split(",").map(a=>a.trim()).filter(Boolean))} />
          </label>
          <label class="chef-wide">Nu ne plac
            <input .value=${e.dislikes||""} placeholder="coriandru, măsline..."
              @input=${t=>this._setChefPreference("dislikes",t.target.value)} />
          </label>
          <label class="chef-wide">Avem deja în cămară
            <input .value=${e.pantry||""} placeholder="sare, ulei, piper..."
              @input=${t=>this._setChefPreference("pantry",t.target.value)} />
          </label>
          <label class="chef-wide">Card de fidelitate (alias, opțional)
            <input .value=${e.loyalty_card_alias||""} placeholder="ex: Cardul familiei"
              @input=${t=>this._setChefPreference("loyalty_card_alias",t.target.value)} />
          </label>
        </div>
        <button class="primary-btn chef-save" @click=${this._saveChefPreferences}>Salvează preferințele</button>
      </section>`}_renderChefProduct(e,t,a){let r=e.sku_id===a;return s`
      <button class="chef-product ${r?"chef-product--selected":""}"
        @click=${()=>this._selectChefProduct(t,e.sku_id)}>
        <span class="chef-product-check">${r?"\u2713":""}</span>
        ${e.image_url?s`<img src=${e.image_url} alt=${e.name} loading="lazy" />`:s`<span class="chef-product-placeholder">${h("cart",24)}</span>`}
        <span class="chef-product-copy">
          <strong>${e.name}</strong>
          <small>${e.brand||"Auchan"} · SKU ${e.sku_id}</small>
          <span><b>${A(e.price)}</b>${e.suggested_packages>1?s` · ${e.suggested_packages} bucăți`:d}</span>
        </span>
      </button>`}_renderChefPlan(){let e=this._chefPlan;if(!e)return d;if(e.type==="clarification")return s`
      <section class="chef-clarification">
        <span class="chef-avatar">?</span>
        <div><strong>Mai am nevoie de un detaliu</strong><p>${e.message}</p></div>
      </section>`;let t=Object.keys(this._chefSelected).length,a=(e.ingredients||[]).reduce((r,i,n)=>{let c=(i.matches||[]).find(p=>p.sku_id===this._chefSelected[n]);return r+(c?.price||0)*(c?.suggested_packages||1)},0);return s`
      <article class="chef-plan">
        <header class="chef-plan-head">
          <div><span class="chef-kicker">Propunerea Chef AI</span><h2>${e.title}</h2><p>${e.description}</p></div>
          <div class="chef-meta"><span>${e.servings} porții</span><span>${e.prep_minutes+e.cook_minutes} min</span><span>${e.difficulty}</span></div>
        </header>
        <section class="chef-plan-section">
          <h3>Ingrediente și produse Auchan</h3>
          <p class="chef-help">Alegerea este a ta. Importăm numai SKU-ul bifat și îl reverificăm înainte de salvare.</p>
          <div class="chef-ingredients">
            ${(e.ingredients||[]).map((r,i)=>s`
              <div class="chef-ingredient">
                <div class="chef-ingredient-title">
                  <span>${i+1}</span>
                  <div>
                    <strong>${r.name}</strong>
                    <small>${r.quantity||""} ${r.unit||""}${r.optional?" \xB7 op\u021Bional":""}</small>
                    ${this._chefSelected[i]?s`<button @click=${()=>this._skipChefProduct(i)}>Am deja / nu cumpăr</button>`:d}
                  </div>
                </div>
                ${(r.matches||[]).length?s`
                  <div class="chef-products">${r.matches.map(n=>this._renderChefProduct(n,i,this._chefSelected[i]))}</div>
                `:s`<div class="chef-no-match">Nu am găsit un produs alimentar suficient de relevant. Ingredientul nu va fi importat.</div>`}
              </div>`)}
          </div>
        </section>
        <section class="chef-plan-section chef-steps">
          <h3>Mod de preparare</h3>
          <ol>${(e.instructions||[]).map(r=>s`<li>${r}</li>`)}</ol>
        </section>
        <footer class="chef-import-bar">
          <div><strong>${t} produse</strong><span>Estimare: ${A(a)}</span></div>
          <select .value=${this._chefTargetListId||this._activeListId||"new"} @change=${r=>this._chefTargetListId=r.target.value}>
            ${(this._lists||[]).map(r=>s`<option value=${r.id}>${r.name}</option>`)}
            <option value="new">+ Listă nouă pentru rețetă</option>
          </select>
          <button class="primary-btn" ?disabled=${this._chefImporting||!t} @click=${this._importChefPlan}>
            ${this._chefImporting?"Se reverific\u0103...":`Adaug\u0103 ${t} produse`}
          </button>
        </footer>
      </article>`}_renderRecipesView(){if(this._chefStatusLoading&&!this._chefStatus)return s`<div class="chef-loading"><div class="spinner"></div><span>Se pregătește Chef AI...</span></div>`;if(!this._chefStatus?.configured)return s`
      <section class="chef-onboarding">
        <span class="chef-avatar">AI</span>
        <h2>Configurează Chef AI</h2>
        <p>Adaugă adresa serviciului privat și tokenul în <strong>Setări → Dispozitive și servicii → Auchan Grocery → Configurează</strong>.</p>
        <button class="secondary-btn" @click=${()=>{this._chefStatus=null,this._loadChef()}}>${h("refresh",16)} Verifică din nou</button>
      </section>`;if(!this._chefStatus?.connected)return s`
      <section class="chef-onboarding">
        <span class="chef-avatar">AI</span>
        <span class="chef-kicker">Fără cheie API</span>
        <h2>Conectează contul ChatGPT</h2>
        <p>Primești un cod, deschizi pagina oficială OpenAI și autorizezi dispozitivul. Datele de autentificare rămân în serviciul tău privat.</p>
        ${this._chefStatus?.error?s`<div class="chef-error">${this._chefStatus.error}</div>`:d}
        ${this._chefLogin?.user_code?s`
          <div class="chef-device-code">
            <small>Cod de autorizare</small>
            <strong>${this._chefLogin.user_code}</strong>
            <div>
              <button class="secondary-btn" @click=${()=>navigator.clipboard?.writeText(this._chefLogin.user_code)}>Copiază codul</button>
              <a class="primary-btn" href=${this._chefLogin.verification_url||"https://auth.openai.com/codex/device"} target="_blank" rel="noopener">Deschide OpenAI</a>
            </div>
            <span class="chef-waiting"><i></i>Aștept autorizarea...</span>
          </div>
        `:s`<button class="primary-btn" ?disabled=${this._chefLogin?.status==="starting"} @click=${this._startChefLogin}>${this._chefLogin?.status==="starting"?"Se genereaz\u0103 codul...":"Conecteaz\u0103 ChatGPT"}</button>`}
      </section>`;let e=this._chefStatus.account||{},t=["Cin\u0103 rapid\u0103 \xEEn 30 de minute","Ceva bun din pui pentru familie","O re\u021Bet\u0103 vegetarian\u0103 economic\u0103"];return s`
      <div class="chef-view">
        <header class="chef-header">
          <div><span class="chef-kicker">Auchan Chef AI</span><h1>Ce gătim azi?</h1><p>Rețetă personalizată, apoi produse reale din magazinul tău.</p></div>
          <div class="chef-account">
            <span><i></i>${e.email||"ChatGPT conectat"}${e.plan_type?` \xB7 ${e.plan_type}`:""}</span>
            <button class="icon-btn" title="Preferințe" @click=${()=>this._chefSettingsOpen=!this._chefSettingsOpen}>${h("wrench",18)}</button>
            <button class="text-btn" @click=${this._logoutChef}>Ieșire</button>
          </div>
        </header>
        ${this._chefSettingsOpen?this._renderChefPreferences():d}
        <section class="chef-composer">
          <textarea .value=${this._chefPrompt} @input=${a=>this._chefPrompt=a.target.value}
            @keydown=${a=>{(a.metaKey||a.ctrlKey)&&a.key==="Enter"&&this._askChef()}}
            placeholder="Ex: Am niște dovlecei și vreau o cină ușoară pentru 3 persoane, fără lactoză..."></textarea>
          <button class="chef-send" ?disabled=${this._chefGenerating||this._chefPrompt.trim().length<3} @click=${()=>this._askChef()} aria-label="Trimite către Chef AI">${this._chefGenerating?s`<div class="spinner spinner--sm"></div>`:h("arrowUp",20)}</button>
          <div class="chef-chips">${t.map(a=>s`<button @click=${()=>{this._chefPrompt=a,this._askChef(a)}}>${a}</button>`)}</div>
        </section>
        ${this._chefGenerating?s`<div class="chef-thinking"><div class="spinner"></div><div><strong>Chef AI pregătește propunerea</strong><span>Apoi verificăm separat produsele și disponibilitatea Auchan.</span></div></div>`:this._renderChefPlan()}
      </div>`}_renderLegacyRecipesView(){return this._recipesLoading?s`
        <div class="recipes-skeleton">
          ${[1,2,3,4,5,6].map(()=>s`
            <div class="recipe-card recipe-skel-card">
              <div class="skel-img"></div>
              <div class="recipe-body">
                <div class="skel-line" style="width:80%"></div>
                <div class="skel-line" style="width:50%;margin-top:6px"></div>
              </div>
            </div>
          `)}
        </div>`:this._recipes?.length?s`
      <div class="recipes-header">
        <span class="recipes-count">${this._recipes.length} rețete</span>
        <button class="icon-btn" @click=${this._loadRecipes} title="Reîncarcă rețete">${h("refresh",16)}</button>
      </div>
      <div class="recipes-grid">
        ${this._recipes.map(e=>this._renderRecipeCard(e))}
      </div>
      ${this._recipeModalData?this._renderRecipeModal():d}
    `:s`
      <div class="empty-state">
        ${h("recipes",48)}
        <h3>Rețete Auchan</h3>
        <p>Nu s-au găsit rețete. Verifică conexiunea la internet.</p>
        <button class="primary-btn" @click=${this._loadRecipes}>${h("refresh",16)} Reîncarcă</button>
      </div>`}_renderRecipeCard(e){return s`
      <article class="recipe-card" role="button" tabindex="0"
        aria-label="Deschide rețeta ${e.title}"
        @click=${()=>this._openRecipeModal(e)}
        @keydown=${t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this._openRecipeModal(e))}}>
        <div class="recipe-img-wrap">
          ${e.image_url?s`
            <img class="recipe-img" src=${e.image_url} alt=${e.title} loading="lazy" referrerpolicy="no-referrer"
                 @error=${t=>t.target.parentElement.innerHTML=`<div class="recipe-img--placeholder">${h("recipes",32)}</div>`} />
          `:s`<div class="recipe-img--placeholder">${h("recipes",32)}</div>`}
          ${e.ingredients?.length>0?s`
            <div class="recipe-badge">${e.ingredients.length} ing.</div>
          `:d}
        </div>
        <div class="recipe-body">
          <h4 class="recipe-title">${e.title}</h4>
          <div class="recipe-meta">
            ${e.prep_time?s`<span>${h("clock",11)} ${e.prep_time}</span>`:d}
            ${e.servings?s`<span>👥 ${e.servings}</span>`:d}
          </div>
        </div>
      </article>`}async _openRecipeModal(e){if(this._recipeModalData={recipe:e,loading:!e.detail_fetched,selected:new Set,importing:!1,result:null},e.detail_fetched)this._recipeModalData.selected=new Set((e.ingredients||[]).map((t,a)=>t.found&&t.sku_id&&t.product_id?a:null).filter(t=>t!==null));else try{let t=await this._api.getJson(`/api/auchan_grocery/recipes/${e.id}/detail`);Object.assign(e,t),e.detail_fetched=!0,this._recipeModalData={...this._recipeModalData,recipe:e,loading:!1},this._recipeModalData.selected=new Set((e.ingredients||[]).map((a,r)=>a.found&&a.sku_id&&a.product_id?r:null).filter(a=>a!==null))}catch{this._recipeModalData={...this._recipeModalData,loading:!1},this._showToast("Nu s-au putut \xEEnc\u0103rca produsele re\u021Betei","error")}}_renderRecipeModal(){let{recipe:e,loading:t,selected:a,importing:r,result:i}=this._recipeModalData,c=(e.ingredients||[]).map((l,u)=>({item:l,index:u})).filter(({item:l})=>l.found&&l.sku_id&&l.product_id),p=this._lists||[];return s`
      <div class="modal-overlay" @click=${()=>this._recipeModalData=null}
           role="dialog" aria-modal="true" aria-label="Produsele rețetei">
        <div class="modal-card recipe-modal" @click=${l=>l.stopPropagation()}>

          <!-- Header -->
          <div class="modal-header">
            <div class="recipe-modal-title-wrap">
              <span class="modal-title">${e.title}</span>
              ${e.prep_time?s`<span class="recipe-modal-meta">⏱ ${e.prep_time}</span>`:d}
              ${e.servings?s`<span class="recipe-modal-meta">👥 ${e.servings}</span>`:d}
            </div>
            <button class="icon-btn" @click=${()=>this._recipeModalData=null} aria-label="Închide">${h("xmark",18)}</button>
          </div>

          <!-- Image (if available) -->
          ${e.image_url?s`
            <img class="recipe-modal-img" src=${e.image_url} alt=${e.title} referrerpolicy="no-referrer" />
          `:d}

          <!-- Import result -->
          ${i?s`
            <div class="recipe-import-result">
              <div class="import-result-row">
                ${h("cart",20)}
                <span>${i.added_count} produse adăugate în lista <strong>${i.list_name}</strong></span>
              </div>
              ${i.not_found?.length?s`
                <div class="import-not-found">
                  <span class="import-not-found-label">Indisponibile:</span>
                  ${i.not_found.map(l=>s`<span class="import-not-found-item">${l}</span>`)}
                </div>
              `:d}
              <button class="primary-btn" style="margin-top:12px;width:100%"
                @click=${()=>{this._recipeModalData=null,this._tab="list"}}>
                ${h("list",16)} Vezi lista
              </button>
            </div>
          `:s`

            <!-- Loading state -->
            ${t?s`
              <div class="recipe-modal-loading">
                <div class="spinner"></div>
                <span>Se încarcă produsele rețetei...</span>
              </div>
            `:s`

              <!-- Ingredients checklist -->
              <div class="ingredients-section">
                <div class="ingredients-header">
                  <span class="section-heading">Produse din sliderul Auchan</span>
                  ${c.length?s`<div class="ingredients-sel-actions">
                    <button class="text-btn" @click=${()=>{this._recipeModalData={...this._recipeModalData,selected:new Set(c.map(({index:l})=>l))}}}>Toate</button>
                    <button class="text-btn" @click=${()=>{this._recipeModalData={...this._recipeModalData,selected:new Set}}}>Niciuna</button>
                  </div>`:d}
                </div>
                <ul class="recipe-ingredients-list">
                  ${c.length===0?s`
                    <li class="recipe-no-ing recipe-no-ing--safe">
                      <strong>Niciun produs verificat</strong>
                      <span>Auchan nu publică un slider de produse pentru această rețetă. Importul automat este dezactivat pentru a evita produse fără legătură.</span>
                    </li>
                  `:c.map(({item:l,index:u})=>s`
                    <li class="recipe-ing-item ${a.has(u)?"recipe-ing-item--checked":""}"
                        @click=${()=>{let v=new Set(a);v.has(u)?v.delete(u):v.add(u),this._recipeModalData={...this._recipeModalData,selected:v}}}>
                      <span class="recipe-ing-check">${a.has(u)?"\u2713":""}</span>
                      ${l.found&&l.image_url?s`
                        <img class="recipe-ing-thumb" src=${l.image_url} alt=${l.name} referrerpolicy="no-referrer" />
                      `:d}
                      <span class="recipe-ing-content">
                        <span class="recipe-ing-name">
                          ${l.name}
                        </span>
                        ${l.sku_id||l.price?s`
                          <span class="recipe-ing-meta">
                            ${l.sku_id?s`SKU ${l.sku_id}`:d}
                            ${l.sku_id&&l.price?s`<span aria-hidden="true">·</span>`:d}
                            ${l.price?s`<strong>${Number(l.price).toFixed(2).replace(".",",")} lei</strong>`:d}
                          </span>
                        `:d}
                      </span>
                    </li>
                  `)}
                </ul>
              </div>

              <!-- Import actions -->
              <div class="recipe-import-actions">
                <div class="recipe-list-selector">
                  <label class="recipe-list-label">${h("list",14)} Adaugă în lista:</label>
                  <select class="header-select" .value=${this._recipeImportListId||this._activeListId||""}
                    @change=${l=>this._recipeImportListId=l.target.value}>
                    ${p.map(l=>s`<option value=${l.id} ?selected=${l.id===(this._recipeImportListId||this._activeListId)}>${l.name||l.id}</option>`)}
                    <option value="new">+ Creează listă nouă din rețetă</option>
                  </select>
                </div>
                <div class="recipe-import-btns">
                  <a href=${e.url} target="_blank" rel="noopener" class="secondary-btn" style="flex:0 0 auto;padding:10px 14px">
                    ${h("link",15)}
                  </a>
                  <button class="primary-btn" style="flex:1"
                    ?disabled=${r||c.length===0||a.size===0}
                    @click=${()=>this._importRecipe(e,a)}>
                    ${r?s`<div class="spinner spinner--sm"></div> Se importă...`:s`${h("cart",16)} Adaugă ${a.size>0?a.size:""} produse`}
                  </button>
                </div>
              </div>
            `}
          `}
        </div>
      </div>`}async _importRecipe(e,t){this._recipeModalData={...this._recipeModalData,importing:!0};let a=e.ingredients||[],r=[...t].map(c=>a[c]).filter(Boolean),i=this._recipeImportListId||this._activeListId,n=i==="new";try{let c=await this._api.postJson(`/api/auchan_grocery/recipes/${e.id}/import`,{list_id:i,list_name:n?`Re\u021Bet\u0103: ${e.title.slice(0,40)}`:void 0,sku_ids:r.map(p=>p.sku_id)});await this._loadLists(),c.list_id&&(this._activeListId=c.list_id),this._recipeModalData={...this._recipeModalData,importing:!1,result:c},this._showToast(`${c.added_count} produse ad\u0103ugate!`,"success")}catch{this._recipeModalData={...this._recipeModalData,importing:!1},this._showToast("Eroare la importul re\u021Betei","error")}}_renderActionBar(){if(!this._activeList||this._tab==="recipes")return d;let e=(this._activeList?.items||[]).filter(t=>t.in_cart!==!1).length;return s`
      <div class="action-bar" role="toolbar" aria-label="Acțiuni">
        <button class="action-btn action-btn--primary" @click=${this._generateCartLink}
          aria-label="Generează link coș">
          ${h("qr",18)} Coș (${e})
        </button>
        <button class="action-btn" @click=${()=>{this._tab="map"}}
          aria-label="Deschide harta">
          ${h("map",18)} Hartă
        </button>
      </div>
    `}_renderQrModal(){return s`
      <div class="modal-overlay" @click=${()=>{this._showQr=!1}} role="dialog" aria-modal="true" aria-label="Link coș">
        <div class="modal-card" @click=${e=>e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">Scanează sau copiază link-ul</span>
            <button class="icon-btn" @click=${()=>{this._showQr=!1}} aria-label="Închide">${h("xmark",18)}</button>
          </div>
          <div id="qr-container" class="qr-container"></div>
          <div class="url-row">
            <input class="url-input" readonly .value=${this._qrUrl||""} aria-label="Link coș" />
            <button class="icon-btn" @click=${()=>navigator.clipboard?.writeText(this._qrUrl)} title="Copiază" aria-label="Copiază link">
              ${h("clipboard",18)}
            </button>
          </div>
          <a href=${this._qrUrl} target="_blank" rel="noopener" class="primary-btn">
            ${h("cart",16)} Deschide pe Auchan.ro
          </a>
        </div>
      </div>
    `}_renderAddressModal(){return s`
      <div class="modal-overlay" @click=${this._closeAddressModal} role="dialog" aria-modal="true" aria-label="Adaugă adresă">
        <div class="modal-card modal-card--addr" @click=${e=>e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">${h("pin",18)} Adresă nouă</span>
            <button class="icon-btn" @click=${this._closeAddressModal} aria-label="Închide">${h("xmark",18)}</button>
          </div>

          <div class="addr-field">
            <label class="field-label">Etichetă</label>
            <div class="chip-row">
              ${["Acas\u0103","Birou","Familie","Altul"].map(e=>s`
                <button class="chip ${this._addrLabel===e?"chip--active":""}"
                  @click=${()=>{this._addrLabel=e}}>
                  ${e}
                </button>
              `)}
            </div>
          </div>

          <div class="addr-field">
            <label class="field-label" for="addr-search">Caută adresa</label>
            <div class="input-wrap">
              <input id="addr-search" class="search-input" type="text"
                placeholder="ex: Auchan Titan, București..."
                .value=${this._addrQuery}
                @input=${this._onAddrInput}
                autocomplete="off" />
              ${this._addrLoading?s`<div class="spinner"></div>`:d}
            </div>
            ${this._addrSuggestions.length>0?s`
              <ul class="suggestions" role="listbox">
                ${this._addrSuggestions.map(e=>s`
                  <li class="suggestion-row" role="option" @click=${()=>this._selectAddrSuggestion(e)}>
                    ${h("pin",14)}
                    <span>${e.display_name}</span>
                  </li>
                `)}
              </ul>
            `:d}
            ${this._addrSelected?s`
              <div class="addr-selected">
                ${h("check",14)}
                <span>${this._addrSelected.display_name}</span>
              </div>
            `:d}
          </div>

          <div class="addr-actions">
            <button class="secondary-btn" @click=${this._closeAddressModal}>Anulează</button>
            <button class="primary-btn" @click=${this._saveAddress}
              ?disabled=${!this._addrSelected||this._addrLoading}>
              ${this._addrLoading?s`<div class="spinner spinner--sm"></div>`:h("check",16)}
              Salvează
            </button>
          </div>
        </div>
      </div>
    `}_renderAddressSheet(){let e=this._addresses||[];return s`
      <div class="sheet-backdrop" @click=${()=>this._showAddressSheet=!1} role="dialog" aria-modal="true" aria-label="Selectează adresa">
        <div class="sheet-card" @click=${t=>t.stopPropagation()}>
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            ${h("pin",18)}
            <span class="sheet-title">Adresă activă</span>
            <button class="icon-btn" @click=${()=>this._showAddressSheet=!1} aria-label="Închide">
              ${h("xmark",18)}
            </button>
          </div>

          <div class="sheet-body">
            ${e.length===0?s`
              <p class="sheet-empty">Nicio adresă salvată. Adaugă una!</p>
            `:e.map(t=>s`
              <div class="sheet-addr-row ${t.is_active?"sheet-addr-row--active":""}"
                @click=${()=>{this._activateAddress(t.id),this._showAddressSheet=!1}}>
                <span class="sheet-addr-icon">${h("pin",16)}</span>
                <div class="sheet-addr-info">
                  <div class="sheet-addr-label">${t.label}</div>
                  ${t.display_name?s`<div class="sheet-addr-sub">${t.display_name}</div>`:d}
                </div>
                ${t.is_active?s`
                  <span class="sheet-addr-check">${h("check",16)}</span>
                `:d}
              </div>
            `)}
          </div>

          <div class="sheet-footer">
            <button class="sheet-add-btn" @click=${this._openAddAddressModal}>
              ${h("plus",16)} Adresă nouă
            </button>
          </div>
        </div>
      </div>
    `}};V(R,"properties",{hass:{type:Object},narrow:{type:Boolean},panel:{type:Object},_lists:{type:Array,state:!0},_activeListId:{type:String,state:!0},_searchQuery:{type:String,state:!0},_searchResults:{type:Array,state:!0},_pickupPoints:{type:Array,state:!0},_addresses:{type:Array,state:!0},_loading:{type:Boolean,state:!0},_searchLoading:{type:Boolean,state:!0},_showQr:{type:Boolean,state:!0},_qrUrl:{type:String,state:!0},_tab:{type:String,state:!0},_notification:{type:Object,state:!0},_recipes:{type:Array,state:!0},_recipesLoading:{type:Boolean,state:!0},_showAddressModal:{type:Boolean,state:!0},_showAddressSheet:{type:Boolean,state:!0},_addrQuery:{type:String,state:!0},_addrSuggestions:{type:Array,state:!0},_addrLabel:{type:String,state:!0},_addrSelected:{type:Object,state:!0},_addrLoading:{type:Boolean,state:!0},_regionInfo:{type:Object,state:!0},_showDiagnostics:{type:Boolean,state:!0},_dialog:{type:Object,state:!0},_dialogValue:{type:String,state:!0},_sortBy:{type:String,state:!0},_filterCategory:{type:String,state:!0},_isMobile:{type:Boolean,state:!0},_pickupPointsLoading:{type:Boolean,state:!0},_busyActions:{type:Object,state:!0},_recipeModalData:{type:Object,state:!0},_recipeImportListId:{type:String,state:!0},_chefStatus:{type:Object,state:!0},_chefStatusLoading:{type:Boolean,state:!0},_chefLogin:{type:Object,state:!0},_chefPrompt:{type:String,state:!0},_chefPlan:{type:Object,state:!0},_chefThreadId:{type:String,state:!0},_chefSelected:{type:Object,state:!0},_chefPreferences:{type:Object,state:!0},_chefSettingsOpen:{type:Boolean,state:!0},_chefGenerating:{type:Boolean,state:!0},_chefImporting:{type:Boolean,state:!0},_chefTargetListId:{type:String,state:!0}}),V(R,"styles",N`
    @font-face {
      font-family: "Source Sans 3";
      src: url("/auchan_grocery_static/fonts/source-sans-3-400.woff2") format("woff2");
      font-style: normal;
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: "Source Sans 3";
      src: url("/auchan_grocery_static/fonts/source-sans-3-600.woff2") format("woff2");
      font-style: normal;
      font-weight: 600;
      font-display: swap;
    }
    @font-face {
      font-family: "Source Sans 3";
      src: url("/auchan_grocery_static/fonts/source-sans-3-700.woff2") format("woff2");
      font-style: normal;
      font-weight: 700;
      font-display: swap;
    }
    /* ── Design Tokens ─────────────────────────────────────────────────────
       Auchan storefront design system. Two rules carry the brand:
       red is identity and promo only, green is the action colour, and the
       neutrals are a cool blue-grey family built around the navy ink. */
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
      font-family: "Source Sans 3", "Segoe UI", system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;

      /* Brand — logo, promo badges, selection. Never a bare action. */
      --brand:       #ED002E;
      --brand-hover: #D40029;
      --brand-tint:  rgba(237, 0, 46, 0.08);

      /* Action — cart, add, confirm, in-stock */
      --action:       #00AC6C;
      --action-hover: #00985F;
      --action-deep:  #007B4D;
      --action-tint:  #E8F9F2;

      /* Ink and neutrals */
      --bg:        #FAFAFA;
      --surface:   #FFFFFF;
      --surface-2: #EEF5FB;
      --surface-3: #D6E1EC;
      --text:      #01172A;
      --text-2:    #3C617E;
      --text-3:    #6B879E;
      --text-mute: #747474;
      --sep:       #D6E1EC;
      --sep-strong:#B0C4D5;

      /* Semantic */
      --green:      #00AC6C;
      --green-deep: #007B4D;
      --green-tint: #E8F9F2;
      --red:        #ED002E;
      --red-tint:   rgba(237, 0, 46, 0.08);
      --blue:       #3FA9F5;
      --blue-tint:  #EEF5FB;
      --amber:      #FFCE42;
      --amber-tint: rgba(255, 206, 66, 0.20);
      --amber-deep: #9A6B00;

      /* Aliases — every rule that should read as brand keeps using these. */
      --accent:       var(--brand);
      --accent-hover: var(--brand-hover);
      --accent-light: var(--brand-tint);

      /* Spacing — 4pt scale */
      --s-1:  4px;
      --s-2:  8px;
      --s-3: 12px;
      --s-4: 16px;
      --s-5: 20px;
      --s-6: 24px;
      --s-7: 32px;

      /* Type scale */
      --fs-2xs: 10px;
      --fs-xs:  12px;
      --fs-sm:  13px;
      --fs-md:  14px;
      --fs-lg:  16px;
      --fs-xl:  20px;
      --fs-2xl: 28px;

      /* Radius */
      --r-xs:    6px;
      --r-sm:    8px;
      --r-md:   12px;
      --r-lg:   16px;
      --r-xl:   20px;
      --r-pill: 999px;

      /* Elevation — surfaces are flat, shadow is reserved for overlays. */
      --sh-sm: none;
      --sh-md: 0 4px 16px rgba(1, 23, 42, .10);
      --sh-lg: 0 16px 40px rgba(1, 23, 42, .18);

      --card-border: 1px solid var(--sep);
    }

    /* ── Dark mode ──────────────────────────────────────────────────────────
       Driven by the Home Assistant theme when the panel can read it (the host
       then carries [theme-known]); otherwise it falls back to the OS setting,
       so an older core still gets a sensible dark mode. The two selectors are
       mutually exclusive: [dark] is only ever set alongside [theme-known]. */
    :host([dark]) { ${Te} }

    @media (prefers-color-scheme: dark) {
      :host(:not([theme-known])) { ${Te} }
    }

    /* ── Root layout ── */
    .panel-root {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--bg);
      color: var(--text);
      overflow: hidden;
    }

    .panel-root--desktop .desktop-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* ── Header — compact single row ── */
    .panel-header {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      padding: 0 var(--s-4);
      background: var(--surface);
      border-bottom: 1px solid var(--sep);
      flex-shrink: 0;
      height: 60px;
    }

    /* HA Home / Back button */
    .hdr-home-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: var(--surface-2);
      color: var(--text-2);
      border-radius: var(--r-sm);
      cursor: pointer;
      flex-shrink: 0;
      transition: background 140ms, color 140ms;
    }
    .hdr-home-btn:hover {
      background: var(--accent-light);
      color: var(--accent);
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      flex-shrink: 0;
      margin-right: var(--s-1);
      position: relative;
      padding-right: var(--s-3);
    }

    .brand-icon {
      width: 28px;
      height: 28px;
      background: var(--brand);
      color: white;
      border-radius: var(--r-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-name {
      font-size: var(--fs-lg);
      font-weight: 700;
      color: var(--brand);
      line-height: 1;
    }
    .brand-name small {
      display: block;
      color: var(--text-2);
      font: 700 8px/1 "Source Sans 3", sans-serif;
      letter-spacing: 1.2px;
      margin-top: var(--s-1);
    }

    /* Address pill — clickable */
    .header-pill {
      display: flex;
      align-items: center;
      gap: var(--s-1);
      padding: var(--s-1) var(--s-2);
      background: var(--surface-2);
      border: 1px solid var(--sep);
      border-radius: var(--r-pill);
      color: var(--text-2);
      font-size: var(--fs-sm);
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      flex-shrink: 1;
      min-width: 0;
      max-width: 240px;
      transition: background 140ms, border-color 140ms;
      white-space: nowrap;
      overflow: hidden;
    }
    .header-pill:hover {
      background: var(--accent-light);
      border-color: var(--accent);
      color: var(--accent);
    }
    .pill-label {
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    /* List selector row */
    .header-list-wrap {
      display: flex;
      align-items: center;
      gap: var(--s-1);
      color: var(--text-3);
      flex: 1;
      min-width: 0;
      max-width: 220px;
    }

    .header-select {
      flex: 1;
      min-width: 0;
      background: transparent;
      border: none;
      color: var(--text);
      padding: var(--s-1) var(--s-1);
      font-size: var(--fs-sm);
      font-weight: 600;
      outline: none;
      cursor: pointer;
      text-overflow: ellipsis;
      appearance: none;
      -webkit-appearance: none;
    }
    .header-select:focus { color: var(--accent); }

    /* Right actions cluster */
    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--s-1);
      margin-left: auto;
      flex-shrink: 0;
    }

    .hdr-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-2);
      border-radius: var(--r-sm);
      cursor: pointer;
      transition: background 120ms, color 120ms;
    }
    .hdr-btn:hover { background: var(--surface-2); color: var(--accent); }
    .hdr-btn--active { color: var(--accent); background: var(--accent-light); }
    .hdr-btn--diag {} /* alias */

    .addr-missing {
      font-size: var(--fs-xs);
      color: var(--amber-deep);
      font-weight: 600;
      padding: var(--s-1) var(--s-2);
      background: var(--amber-tint);
      border-radius: var(--r-pill);
    }

    /* ── Diagnostics ── */
    .diagnostics {
      background: var(--surface);
      border-bottom: 1px solid var(--sep);
      padding: var(--s-3) var(--s-4);
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-2);
      align-items: center;
      font-size: var(--fs-xs);
      animation: slideDown 150ms ease-out;
      flex-shrink: 0;
    }

    .diag-row { display: flex; align-items: center; gap: var(--s-2); }
    .diag-label { color: var(--text-2); }
    .diag-val { font-family: "SF Mono", "Fira Code", monospace; color: var(--accent); background: var(--accent-light); padding: 1px var(--s-1); border-radius: 4px; max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
    .diag-val--missing { color: var(--red); background: var(--red-tint); }
    .diag-refresh-btn { margin-left: auto; font-size: var(--fs-xs); font-weight: 600; color: var(--blue); background: none; border: none; cursor: pointer; padding: var(--s-1) var(--s-2); border-radius: var(--r-xs); }
    .diag-refresh-btn:hover { background: var(--blue-tint); }

    /* ── Search ── */
    .search-wrap {
      position: relative;
      z-index: 100;
      flex-shrink: 0;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-4);
      background: var(--surface);
      border-bottom: 1px solid var(--sep);
    }

    .search-icon { color: var(--text-3); flex-shrink: 0; }

    .search-input {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--sep-strong);
      border-radius: var(--r-sm);
      color: var(--text);
      padding: var(--s-3) var(--s-4);
      font-size: var(--fs-md);
      outline: none;
      transition: border-color 150ms, box-shadow 150ms;
    }
    .search-input::placeholder { color: var(--text-3); }
    .search-input:focus {
      border-color: var(--action);
      box-shadow: 0 0 0 3px var(--action-tint);
    }

    .search-clear {
      background: none;
      border: none;
      color: var(--text-3);
      cursor: pointer;
      padding: var(--s-1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      transition: background 120ms;
    }
    .search-clear:hover { background: var(--surface-2); color: var(--text); }

    /* ── Search Results ── */
    .search-results {
      position: absolute;
      inset: 100% 0 auto 0;
      background: var(--surface);
      border: 1px solid var(--sep);
      border-top: none;
      max-height: 60vh;
      overflow-y: auto;
      box-shadow: var(--sh-lg);
      border-radius: 0 0 var(--r-md) var(--r-md);
      animation: slideDown 180ms ease-out;
    }

    .search-row {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-4);
      cursor: pointer;
      transition: background 100ms;
      border-bottom: 1px solid var(--sep);
    }
    .search-row:last-child { border-bottom: none; }
    .search-row:hover { background: var(--surface-2); }

    .search-thumb {
      width: 48px;
      height: 48px;
      object-fit: contain;
      border-radius: var(--r-xs);
      background: var(--surface-2);
      flex-shrink: 0;
    }
    .search-thumb--placeholder { display: flex; align-items: center; justify-content: center; }

    .search-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--s-1); }
    .search-name { font-size: var(--fs-xs); font-weight: 500; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3; }
    .search-brand { font-size: var(--fs-xs); color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; }

    .search-price-col { display: flex; flex-direction: column; align-items: flex-end; gap: var(--s-1); flex-shrink: 0; }
    .search-price { font-size: var(--fs-md); font-weight: 700; color: var(--text); }
    .search-discount { font-size: var(--fs-xs); font-weight: 700; color: var(--green); background: var(--green-tint); padding: 1px var(--s-2); border-radius: var(--r-pill); }

    .search-add-btn {
      width: 34px; height: 34px;
      background: var(--action); color: white;
      border: none; border-radius: var(--r-xs);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 120ms, transform 120ms;
    }
    .search-add-btn:hover { background: var(--action-hover); }

    .search-skeleton {
      height: 64px;
      margin: var(--s-2) var(--s-4);
      border-radius: var(--r-sm);
      animation: shimmer 1.4s infinite;
      background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
      background-size: 200% 100%;
    }

    /* ── Tabs ── */
    .tab-bar {
      display: flex;
      background: var(--surface);
      border-bottom: 1px solid var(--sep);
      flex-shrink: 0;
      overflow-x: auto;
    }

    .tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--s-1);
      padding: var(--s-2) var(--s-1);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-3);
      cursor: pointer;
      font-size: var(--fs-2xs);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      transition: color 150ms, border-color 150ms;
      min-height: 49px;
      min-width: 44px;
    }

    .tab--active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    .tab-label { font-size: var(--fs-2xs); }

    /* ── Tab content ── */
    .tab-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--s-3);
    }

    /* Desktop sidebar */
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--sep);
      overflow-y: auto;
      padding: var(--s-3);
    }

    .sidebar-nav { display: flex; flex-direction: column; gap: var(--s-4); }
    .sidebar-section { display: flex; flex-direction: column; gap: var(--s-1); }
    .sidebar-heading { font-size: var(--fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-3); padding: 0 var(--s-1) var(--s-2); margin: 0; border-bottom: 1px solid var(--sep); }
    .sidebar-item { display: flex; align-items: center; gap: var(--s-2); padding: var(--s-2) var(--s-3); border: none; background: none; border-radius: var(--r-sm); color: var(--text-2); cursor: pointer; font-size: var(--fs-md); font-weight: 500; width: 100%; transition: background 120ms; text-align: left; }
    .sidebar-item:hover { background: var(--surface-2); }
    .sidebar-item--active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
    .sidebar-count { margin-left: auto; font-size: var(--fs-xs); background: var(--surface-2); padding: var(--s-1) var(--s-2); border-radius: var(--r-pill); color: var(--text-2); }
    .sidebar-add-btn { display: flex; align-items: center; gap: var(--s-2); padding: var(--s-2) var(--s-3); border: 1px dashed var(--sep); background: none; border-radius: var(--r-sm); color: var(--text-3); cursor: pointer; font-size: var(--fs-sm); width: 100%; transition: all 120ms; }
    .sidebar-add-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
    .sidebar-addr { display: flex; align-items: center; gap: var(--s-1); }
    .sidebar-addr-main { display: flex; align-items: center; gap: var(--s-2); flex: 1; padding: var(--s-2) var(--s-3); border: none; background: none; border-radius: var(--r-sm); cursor: pointer; font-size: var(--fs-sm); font-weight: 500; color: var(--text-2); transition: background 120ms; }
    .sidebar-addr-main:hover { background: var(--surface-2); }
    .sidebar-addr--active .sidebar-addr-main { color: var(--accent); }
    .sidebar-addr-del { width: 28px; height: 28px; border: none; background: none; color: var(--text-3); cursor: pointer; border-radius: var(--r-xs); display: flex; align-items: center; justify-content: center; transition: background 120ms, color 120ms; }
    .sidebar-addr-del:hover { background: var(--red-tint); color: var(--red); }
    .dot-active { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-left: auto; }

    /* Desktop main content */
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    /* ── Dashboard ── */
    .dash {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      padding-bottom: 80px;
    }

    .dash-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--s-5);
      background: var(--surface);
      border-radius: var(--r-lg);
      border: 1px solid var(--sep);
      box-shadow: var(--sh-sm);
      position: relative;
      overflow: hidden;
    }
    .dash-list-name { margin: 0 0 var(--s-2); font: 700 var(--fs-2xl)/1.1 inherit; color: var(--text); }
    .dash-total-label { font-size: var(--fs-xs); text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-3); font-weight: 600; }
    .dash-total-val { font: 700 var(--fs-2xl)/1.1 inherit; color: var(--text); font-variant-numeric: tabular-nums; }
    .dash-hero-right { text-align: right; display: flex; flex-direction: column; gap: var(--s-1); z-index: 1; }

    .dash-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--s-1);
      font-size: var(--fs-xs);
      font-weight: 600;
      padding: var(--s-1) var(--s-3);
      border-radius: var(--r-pill);
    }
    .dash-chip--green { background: var(--green-tint); color: var(--green); }

    .bento {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--s-3);
    }

    .bento-card {
      background: var(--surface);
      border-radius: var(--r-md);
      border: var(--card-border, 1px solid var(--sep));
      box-shadow: var(--sh-sm);
      padding: var(--s-4);
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      transition: transform 200ms, box-shadow 200ms;
    }
    .bento-card:hover { border-color: var(--sep-strong); }

    .stat-card {
      flex-direction: row;
      align-items: center;
      cursor: pointer;
      border: none;
      text-align: left;
      color: var(--text);
    }
    .stat-card--alert { border-color: var(--red); background: var(--red-tint); }

    .stat-icon {
      width: 44px; height: 44px;
      border-radius: var(--r-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon--blue { background: var(--blue-tint); color: var(--blue); }
    .stat-icon--orange { background: var(--amber-tint); color: var(--amber-deep); }
    .stat-icon--red { background: var(--red-tint); color: var(--red); }
    .stat-icon--green { background: var(--green-tint); color: var(--green); }

    .stat-body { display: flex; flex-direction: column; }
    .stat-num { font-size: var(--fs-xl); font-weight: 700; line-height: 1.15; font-variant-numeric: tabular-nums; }
    .stat-name { font-size: var(--fs-xs); color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }

    .card-section-title { font-size: var(--fs-sm); font-weight: 600; color: var(--text-2); margin: 0 0 var(--s-2); padding-bottom: var(--s-2); border-bottom: 1px solid var(--sep); }
    .cat-row { display: flex; align-items: center; justify-content: space-between; padding: var(--s-2) 0; border: none; background: none; width: 100%; cursor: pointer; color: var(--text); font-size: var(--fs-sm); transition: opacity 120ms; }
    .cat-row:hover { opacity: 0.7; }
    .cat-name { font-weight: 500; }
    .cat-badge { font-size: var(--fs-xs); font-weight: 700; background: var(--accent-light); color: var(--accent); padding: var(--s-1) var(--s-3); border-radius: var(--r-pill); }

    /* ── List View ── */
    .list-view { display: flex; flex-direction: column; gap: var(--s-3); }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: var(--s-1);
    }

    .filter-chips { display: flex; gap: var(--s-2); flex-shrink: 0; }

    .filter-chip {
      padding: var(--s-1) var(--s-3);
      border-radius: var(--r-pill);
      border: 1px solid var(--sep);
      background: var(--surface);
      color: var(--text-2);
      font-size: var(--fs-sm);
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 120ms;
    }
    .filter-chip--active { background: var(--accent-light); border-color: var(--accent); color: var(--accent); font-weight: 600; }

    .sort-select {
      margin-left: auto;
      flex-shrink: 0;
      background: var(--surface);
      border: 1px solid var(--sep);
      border-radius: var(--r-sm);
      color: var(--text-2);
      padding: var(--s-1) var(--s-2);
      font-size: var(--fs-xs);
      outline: none;
      cursor: pointer;
    }

    .product-list { list-style: none; margin: 0; padding: 0 0 80px; display: flex; flex-direction: column; gap: var(--s-2); }

    /* ── Product Card ── */
    .product-card {
      display: flex;
      background: var(--surface);
      border-radius: var(--r-md);
      border: var(--card-border, 1px solid var(--sep));
      box-shadow: var(--sh-sm);
      overflow: hidden;
      transition: transform 200ms, box-shadow 200ms;
    }
    .product-card:hover { border-color: var(--sep-strong); }
    .product-card--unchecked { opacity: 0.65; }
    .product-card--unavail { filter: grayscale(0.6); }

    .prod-thumb-wrap {
      width: 88px;
      min-width: 88px;
      background: var(--surface);
      border-right: 1px solid var(--sep);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--s-3);
      position: relative;
    }

    .prod-thumb {
      max-width: 68px;
      max-height: 68px;
      object-fit: contain;
    }
    .prod-thumb--fallback { color: var(--text-3); }

    .discount-badge {
      position: absolute;
      top: var(--s-1);
      left: var(--s-1);
      background: var(--brand);
      color: #fff;
      font-size: var(--fs-2xs);
      font-weight: 700;
      padding: 2px var(--s-1);
      border-radius: var(--r-xs);
    }

    .prod-body {
      flex: 1;
      min-width: 0;
      padding: var(--s-3) var(--s-4);
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
    }

    .prod-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .prod-brand { font-size: var(--fs-2xs); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-3); }
    .prod-actions { display: flex; gap: var(--s-1); margin-top: -4px; margin-right: -6px; }

    .prod-name {
      font-size: var(--fs-md);
      font-weight: 500;
      line-height: 1.4;
      color: var(--text);
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .prod-name a { color: inherit; text-decoration: none; }
    .prod-name a:hover { color: var(--accent); text-decoration: underline; }

    .prod-avail { display: flex; align-items: center; gap: var(--s-1); }
    .avail-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .avail-label { font-size: var(--fs-xs); font-weight: 700; }

    .prod-footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--s-2);
      margin-top: auto;
      padding-top: var(--s-2);
    }

    .price-block { display: flex; flex-direction: column; }
    .price-current { font-size: var(--fs-lg); font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .price-original { font-size: var(--fs-xs); text-decoration: line-through; color: var(--text-mute); white-space: nowrap; }

    .prod-controls { display: flex; gap: var(--s-2); align-items: center; }

    .qty-control {
      display: flex;
      align-items: center;
      background: var(--surface-2);
      border-radius: var(--r-pill);
      padding: var(--s-1);
      gap: 0;
    }

    .qty-btn {
      width: 30px; height: 30px;
      border: none; background: var(--surface);
      border-radius: 50%;
      cursor: pointer;
      font-size: var(--fs-xl);
      line-height: 1;
      color: var(--text-2);
      display: flex; align-items: center; justify-content: center;
      box-shadow: var(--sh-sm);
      transition: background 120ms;
      flex-shrink: 0;
    }
    .qty-btn:hover { background: var(--text); color: white; }

    .qty-val {
      width: 30px;
      text-align: center;
      font-size: var(--fs-md);
      font-weight: 700;
      color: var(--text);
    }

    .cart-toggle-btn {
      background: var(--surface-3);
      color: var(--text-2);
      border: none;
      border-radius: var(--r-pill);
      padding: 0 var(--s-4);
      height: 32px;
      font-size: var(--fs-sm);
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms;
      white-space: nowrap;
      min-width: 44px;
    }
    .cart-toggle-btn:hover { background: var(--text); color: white; }
    .cart-toggle-btn--active { background: var(--action); color: white; }
    .cart-toggle-btn--active:hover { background: var(--action-hover); }

    /* ── Shared Buttons ── */
    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-3);
      border-radius: var(--r-xs);
      cursor: pointer;
      transition: background 120ms, color 120ms;
      flex-shrink: 0;
    }
    .icon-btn:hover { background: var(--surface-2); color: var(--text-2); }
    .icon-btn--watch-active { color: var(--amber-deep) !important; }
    .icon-btn--watch-active:hover { color: var(--amber-deep) !important; }
    .icon-btn--danger:hover { background: var(--red-tint); color: var(--red); }

    .primary-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-2);
      background: var(--action);
      color: white;
      border: none;
      border-radius: var(--r-sm);
      padding: var(--s-3) var(--s-5);
      font-size: var(--fs-md);
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms, transform 150ms;
      text-decoration: none;
    }
    .primary-btn:hover { background: var(--action-hover); }
    .primary-btn[disabled] { opacity: 0.5; cursor: not-allowed; transform: none; }

    .secondary-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-2);
      background: var(--surface-2);
      color: var(--text-2);
      border: 1px solid var(--sep);
      border-radius: var(--r-sm);
      padding: var(--s-3) var(--s-5);
      font-size: var(--fs-md);
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms;
    }
    .secondary-btn:hover { background: var(--surface-3); }

    /* ── Action Bar ── */
    .action-bar {
      display: flex;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-4);
      padding-bottom: max(12px, env(safe-area-inset-bottom));
      background: var(--surface);
      border-top: 1px solid var(--sep);
      flex-shrink: 0;
      box-shadow: 0 -4px 12px rgba(1, 23, 42, .05);
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-2);
      padding: var(--s-3);
      border-radius: var(--r-sm);
      border: 1px solid var(--sep);
      background: var(--surface-2);
      color: var(--text);
      cursor: pointer;
      font-size: var(--fs-md);
      font-weight: 600;
      transition: all 150ms;
      min-height: 48px;
    }
    .action-btn:hover { background: var(--surface-3); }
    .action-btn--primary {
      background: var(--action);
      color: white;
      border: none;
    }
    .action-btn--primary:hover { background: var(--action-hover); }

    /* ── Map View ── */
    .map-view { display: flex; flex-direction: column; gap: var(--s-3); height: 100%; }
    .leaflet-iframe {
      width: 100%; height: 320px;
      border: 1px solid var(--sep);
      border-radius: var(--r-md);
      background: var(--surface-2);
      flex-shrink: 0;
    }

    .pickup-list { list-style: none; margin: 0; padding: 0 0 80px; display: flex; flex-direction: column; gap: var(--s-2); }

    .map-stores-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--s-1);
    }

    .section-heading { font: 700 var(--fs-xl)/1.2 inherit; color: var(--text); margin: 0; }

    .pickup-skeleton { display: flex; flex-direction: column; gap: var(--s-2); }
    .pickup-skel-row { height: 64px; border-radius: var(--r-md); }

    .pickup-item {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: var(--s-3) var(--s-4);
      background: var(--surface);
      border: 1px solid var(--sep);
      border-radius: var(--r-md);
      box-shadow: var(--sh-sm);
      transition: transform 150ms, box-shadow 150ms;
    }
    .pickup-item:hover { border-color: var(--sep-strong); }
    .pickup-item--best { border-color: var(--accent); border-width: 2px; }

    .pickup-icon { color: var(--accent); flex-shrink: 0; }
    .pickup-info { flex: 1; display: flex; flex-direction: column; gap: var(--s-1); }
    .pickup-name { font-size: var(--fs-md); font-weight: 600; color: var(--text); }
    .pickup-addr { font-size: var(--fs-xs); color: var(--text-3); }
    .pickup-right { display: flex; align-items: center; gap: var(--s-1); flex-shrink: 0; }
    .pickup-dist { font-size: var(--fs-sm); font-weight: 700; color: var(--accent); }

    /* ── Recipes ── */
    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--s-3);
      padding-bottom: 80px;
    }

    .recipe-card {
      background: var(--surface);
      border-radius: var(--r-md);
      border: 1px solid var(--sep);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 150ms, box-shadow 150ms;
    }
    .recipe-card:hover { border-color: var(--sep-strong); }

    .recipe-img { width: 100%; height: 110px; object-fit: cover; display: block; }
    .recipe-img--placeholder { display: flex; align-items: center; justify-content: center; background: var(--surface-2); height: 110px; color: var(--text-3); }

    .recipe-body { padding: var(--s-2) var(--s-3); flex: 1; }
    .recipe-title { font-size: var(--fs-sm); font-weight: 600; color: var(--text); margin: 0 0 var(--s-1); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .recipe-meta { display: flex; gap: var(--s-2); flex-wrap: wrap; }
    .recipe-meta span { font-size: var(--fs-xs); color: var(--text-3); }

    .recipe-actions {
      display: flex;
      gap: var(--s-2);
      padding: var(--s-2) var(--s-3);
      border-top: 1px solid var(--sep);
    }
    .recipe-btn {
      display: flex; align-items: center; gap: var(--s-1);
      font-size: var(--fs-xs); font-weight: 600;
      padding: var(--s-1) var(--s-3);
      border-radius: var(--r-xs);
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: background 120ms;
    }
    .recipe-btn--link { background: var(--surface-2); color: var(--blue); }
    .recipe-btn--link:hover { background: var(--blue-tint); }
    .recipe-btn--add { background: var(--accent-light); color: var(--accent); }
    .recipe-btn--add:hover { background: var(--brand-tint); }

    /* ── Recipes enhanced ── */
    .recipes-header { display: flex; align-items: center; justify-content: space-between; padding: 0 var(--s-1) var(--s-3); }
    .recipes-count { font-size: var(--fs-xs); font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; }

    .recipes-skeleton { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: var(--s-3); }
    .recipe-skel-card { background: var(--surface); border-radius: var(--r-md); overflow: hidden; }
    .skel-img { width: 100%; height: 110px; }

    .recipe-img-wrap { position: relative; background: var(--surface-2); }
    .recipe-img-wrap .recipe-img { width: 100%; height: 110px; object-fit: cover; display: block; }
    .recipe-img-wrap .recipe-img--placeholder { display: flex; align-items: center; justify-content: center; height: 110px; color: var(--text-3); }
    .recipe-badge {
      position: absolute; bottom: 6px; right: 6px;
      background: rgba(1, 23, 42, .55); color: white;
      font-size: var(--fs-2xs); font-weight: 700; padding: var(--s-1) var(--s-2);
      border-radius: var(--r-pill); backdrop-filter: blur(4px);
    }
    .recipe-card { cursor: pointer; }

    /* ── Recipe Modal ── */
    .recipe-modal { border-radius: var(--r-xl); padding: 0; overflow: hidden; gap: 0; }

    .recipe-modal-title-wrap { flex: 1; display: flex; flex-direction: column; gap: var(--s-1); }
    .recipe-modal-meta { font-size: var(--fs-xs); color: var(--text-3); font-weight: 500; }
    .recipe-modal .modal-header { padding: var(--s-4) var(--s-4) var(--s-3); border-bottom: 1px solid var(--sep); }

    .recipe-modal-img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
      flex-shrink: 0;
    }

    .recipe-modal-loading {
      display: flex; align-items: center; gap: var(--s-3);
      padding: var(--s-6) var(--s-4); color: var(--text-2); font-size: var(--fs-md);
    }

    /* ── Ingredients checklist ── */
    .ingredients-section { padding: var(--s-3) var(--s-4) 0; }
    .ingredients-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--s-2); }
    .ingredients-sel-actions { display: flex; gap: var(--s-2); }

    .text-btn {
      background: none; border: none;
      color: var(--accent); font-size: var(--fs-xs); font-weight: 600;
      cursor: pointer; padding: var(--s-1) var(--s-2); border-radius: var(--r-xs);
      transition: background 120ms;
    }
    .text-btn:hover { background: var(--accent-light); }

    .recipe-ingredients-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--s-1); max-height: 240px; overflow-y: auto; }
    .recipe-no-ing { font-size: var(--fs-sm); color: var(--text-3); padding: var(--s-3) 0; text-align: center; }
    .recipe-no-ing--safe { display: flex; flex-direction: column; gap: var(--s-1); padding: var(--s-4); border: 1px solid var(--sep); border-left: 3px solid var(--accent); border-radius: var(--r-sm); background: var(--surface-2); text-align: left; }
    .recipe-no-ing--safe strong { color: var(--text); font-size: var(--fs-sm); }
    .recipe-no-ing--safe span { line-height: 1.35; }

    .recipe-ing-item {
      display: flex; align-items: center; gap: var(--s-3);
      padding: var(--s-2) var(--s-3);
      border-radius: var(--r-sm);
      background: var(--surface-2);
      cursor: pointer;
      transition: background 120ms;
      user-select: none;
    }
    .recipe-ing-item:hover { background: var(--surface-3); }
    .recipe-ing-item--checked { background: var(--accent-light); }

    .recipe-ing-check {
      width: 20px; height: 20px; min-width: 20px;
      border: 1.5px solid var(--sep);
      border-radius: var(--r-xs);
      display: flex; align-items: center; justify-content: center;
      font-size: var(--fs-xs); font-weight: 700; color: var(--accent);
      background: var(--surface);
      transition: all 120ms;
    }
    .recipe-ing-item--checked .recipe-ing-check { background: var(--accent); color: white; border-color: var(--accent); }
    .recipe-ing-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--s-1); }
    .recipe-ing-name { font-size: var(--fs-sm); line-height: 1.25; color: var(--text); }
    .recipe-ing-name strong { color: var(--accent); font-variant-numeric: tabular-nums; }
    .recipe-ing-meta { display: flex; align-items: center; gap: var(--s-1); color: var(--text-3); font-size: var(--fs-2xs); letter-spacing: .02em; }
    .recipe-ing-meta strong { color: var(--accent); font-size: var(--fs-xs); font-variant-numeric: tabular-nums; }
    .recipe-ing-thumb { width: 42px; height: 42px; flex: 0 0 42px; object-fit: contain; border-radius: var(--r-xs); background: var(--surface); }

    /* ── Import actions ── */
    .recipe-import-actions { padding: var(--s-3) var(--s-4) var(--s-4); display: flex; flex-direction: column; gap: var(--s-3); border-top: 1px solid var(--sep); margin-top: var(--s-2); }
    .recipe-list-selector { display: flex; align-items: center; gap: var(--s-2); }
    .recipe-list-label { font-size: var(--fs-sm); font-weight: 600; color: var(--text-2); white-space: nowrap; display: flex; align-items: center; gap: var(--s-1); }
    .recipe-list-selector .header-select { flex: 1; }
    .recipe-import-btns { display: flex; gap: var(--s-2); align-items: stretch; }

    /* ── Import result ── */
    .recipe-import-result { padding: var(--s-4); display: flex; flex-direction: column; gap: var(--s-3); }
    .import-result-row { display: flex; align-items: center; gap: var(--s-3); font-size: var(--fs-md); font-weight: 500; color: var(--text); }
    .import-not-found { display: flex; flex-wrap: wrap; gap: var(--s-2); align-items: center; }
    .import-not-found-label { font-size: var(--fs-xs); font-weight: 600; color: var(--text-3); }
    .import-not-found-item { font-size: var(--fs-xs); background: var(--red-tint); color: var(--red); padding: var(--s-1) var(--s-2); border-radius: var(--r-pill); }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(1, 23, 42, .60);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 150ms ease;
    }

    @media (min-width: 480px) {
      .modal-overlay { align-items: center; }
    }

    .modal-card {
      background: var(--surface);
      border-radius: var(--r-xl) var(--r-xl) 0 0;
      padding: var(--s-5);
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      box-shadow: 0 -4px 32px rgba(1, 23, 42, .20);
      animation: slideUp 200ms ease-out;
      max-height: 90vh;
      overflow-y: auto;
    }

    @media (min-width: 480px) {
      .modal-card { border-radius: var(--r-xl); animation: popIn 200ms ease-out; box-shadow: var(--sh-lg); }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--fs-lg);
      font-weight: 700;
    }
    .modal-title { display: flex; align-items: center; gap: var(--s-2); }

    .modal-card--addr { max-width: 400px; }

    .qr-container { background: white; padding: var(--s-3); border-radius: var(--r-md); align-self: center; }
    .url-row { display: flex; gap: var(--s-2); width: 100%; }
    .url-input { flex: 1; background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-sm); color: var(--text-3); padding: var(--s-2) var(--s-3); font-size: var(--fs-xs); outline: none; overflow: hidden; text-overflow: ellipsis; }

    /* ── Address Modal Fields ── */
    .addr-field { display: flex; flex-direction: column; gap: var(--s-2); }
    .field-label { font-size: var(--fs-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-3); }
    .chip-row { display: flex; gap: var(--s-2); flex-wrap: wrap; }
    .chip { padding: var(--s-2) var(--s-4); border-radius: var(--r-pill); border: 1.5px solid var(--sep); background: var(--surface-2); color: var(--text-2); cursor: pointer; font-size: var(--fs-sm); font-weight: 500; transition: all 120ms; }
    .chip--active { background: var(--accent-light); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    .input-wrap { position: relative; display: flex; align-items: center; gap: var(--s-2); }
    .suggestions { list-style: none; margin: 0; padding: 0; background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-md); max-height: 180px; overflow-y: auto; animation: slideDown 150ms ease-out; }
    .suggestion-row { display: flex; align-items: flex-start; gap: var(--s-2); padding: var(--s-2) var(--s-3); cursor: pointer; border-bottom: 1px solid var(--sep); transition: background 100ms; font-size: var(--fs-sm); color: var(--text); }
    .suggestion-row:last-child { border-bottom: none; }
    .suggestion-row:hover { background: var(--surface); }
    .addr-selected { display: flex; align-items: center; gap: var(--s-2); font-size: var(--fs-sm); color: var(--green); padding: var(--s-2) var(--s-3); background: var(--green-tint); border-radius: var(--r-sm); border: 1px solid var(--green); }
    .addr-actions { display: flex; justify-content: space-between; gap: var(--s-3); }

    /* ── Custom Dialog ── */
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(1, 23, 42, .50);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 120ms ease;
    }

    .dialog-sheet {
      background: var(--surface);
      border-radius: var(--r-xl) var(--r-xl) 0 0;
      padding: var(--s-6) var(--s-5);
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      animation: slideUp 180ms ease-out;
    }

    @media (min-width: 480px) {
      .dialog-overlay { align-items: center; }
      .dialog-sheet { border-radius: var(--r-xl); }
    }

    .dialog-message { margin: 0; font-size: var(--fs-lg); font-weight: 600; color: var(--text); text-align: center; }
    .dialog-input { background: var(--surface-2); border: 1.5px solid var(--sep); border-radius: var(--r-sm); color: var(--text); padding: var(--s-3); font-size: var(--fs-md); outline: none; width: 100%; box-sizing: border-box; transition: border-color 150ms; }
    .dialog-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
    .dialog-actions { display: flex; gap: var(--s-3); }
    .dialog-btn { flex: 1; padding: var(--s-3); border: none; border-radius: var(--r-sm); font-size: var(--fs-lg); font-weight: 600; cursor: pointer; transition: background 150ms; min-height: 48px; }
    .dialog-btn--cancel { background: var(--surface-2); color: var(--text-2); }
    .dialog-btn--cancel:hover { background: var(--surface-3); }
    .dialog-btn--confirm { background: var(--action); color: white; }
    .dialog-btn--confirm:hover { background: var(--action-hover); }
    .dialog-btn--danger { background: var(--red); color: white; }
    .dialog-btn--danger:hover { background: var(--brand-hover); }

    /* ── Spinner ── */
    .spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--sep);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 600ms linear infinite;
      flex-shrink: 0;
    }
    .spinner--sm { width: 14px; height: 14px; }
    .spinner--lg { width: 36px; height: 36px; border-width: 3px; }

    /* ── Skeleton ── */
    .skeleton-card {
      height: 100px;
      background: var(--surface) !important;
    }

    .skeleton {
      background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: var(--r-xs);
    }

    .skeleton-img { width: 68px; height: 68px; border-radius: var(--r-sm); }
    .skeleton-body { flex: 1; display: flex; flex-direction: column; gap: var(--s-2); padding: var(--s-4); }
    .skeleton-line { height: 12px; border-radius: var(--r-xs); }
    .skeleton-line--short { width: 40%; }
    .skeleton-line--med { width: 65%; }

    /* ── Empty state ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--s-3);
      padding: 60px var(--s-5);
      text-align: center;
      color: var(--text-2);
    }
    .empty-state h3 { margin: 0; font-size: var(--fs-xl); font-weight: 700; color: var(--text); }
    .empty-state p { margin: 0; font-size: var(--fs-md); color: var(--text-3); }

    .loading-center { display: flex; flex-direction: column; align-items: center; gap: var(--s-3); padding: 60px var(--s-5); color: var(--text-3); font-size: var(--fs-md); }

    /* ── Toast ── */
    .toast {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      padding: var(--s-3) var(--s-5);
      border-radius: var(--r-sm);
      font-size: var(--fs-md);
      font-weight: 600;
      animation: toastIn 200ms ease-out, toastOut 250ms 3s ease-in forwards;
      box-shadow: var(--sh-lg);
      white-space: nowrap;
      max-width: 90vw;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .toast--success { background: var(--green); color: white; }
    .toast--info    { background: var(--blue); color: white; }
    .toast--error   { background: var(--red); color: white; }

    /* ── Animations ── */
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes toastOut {
      from { opacity: 1; }
      to   { opacity: 0; }
    }

    /* ── Icon helper ── */
    .icon svg { width: 100%; height: 100%; }

    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible,
    [tabindex]:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--accent) 45%, transparent);
      outline-offset: 2px;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: .55;
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 1ms !important;
      }
    }

    /* ── Chef AI ── */
    .chef-view { max-width: 1180px; margin: 0 auto; padding-bottom: 92px; }
    .chef-header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--s-6); margin: var(--s-1) 0 var(--s-5); }
    .chef-header h1, .chef-plan h2 { margin: var(--s-1) 0 var(--s-2); font: 700 var(--fs-2xl)/1.15 inherit; color: var(--text); }
    .chef-header p, .chef-plan-head p { margin: 0; color: var(--text-2); line-height: 1.45; }
    .chef-kicker { color: var(--accent); text-transform: uppercase; letter-spacing: .09em; font-size: var(--fs-xs); font-weight: 800; }
    .chef-account { display: flex; align-items: center; gap: var(--s-2); color: var(--text-3); font-size: var(--fs-xs); }
    .chef-account > span { display: flex; align-items: center; gap: var(--s-2); }
    .chef-account i, .chef-waiting i { width: 8px; height: 8px; display: inline-block; border-radius: 50%; background: var(--action); box-shadow: 0 0 0 4px var(--action-tint); }

    .chef-composer { position: relative; padding: var(--s-4); background: var(--surface); border: 1px solid var(--sep); border-radius: var(--r-xl); box-shadow: var(--sh-md); }
    .chef-composer textarea { width: 100%; min-height: 94px; resize: vertical; box-sizing: border-box; padding: var(--s-1) 52px var(--s-3) var(--s-1); border: 0; outline: 0; color: var(--text); background: transparent; font: 500 16px/1.45 inherit; }
    .chef-send { position: absolute; right: 16px; top: 16px; width: 42px; height: 42px; display: grid; place-items: center; color: #fff; background: var(--action); border: 0; border-radius: var(--r-md); cursor: pointer; }
    .chef-chips { display: flex; gap: var(--s-2); flex-wrap: wrap; padding-top: var(--s-3); border-top: 1px solid var(--sep); }
    .chef-chips button { padding: var(--s-2) var(--s-3); border: 1px solid var(--sep); border-radius: var(--r-pill); color: var(--text-2); background: var(--surface-2); font-size: var(--fs-xs); cursor: pointer; }
    .chef-chips button:hover { border-color: var(--accent); color: var(--accent); }

    .chef-settings { margin-bottom: var(--s-4); padding: var(--s-4); background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-lg); }
    .chef-settings-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: var(--s-3); }
    .chef-settings label { display: flex; flex-direction: column; gap: var(--s-2); color: var(--text-2); font-size: var(--fs-xs); font-weight: 700; }
    .chef-settings input, .chef-settings select, .chef-import-bar select { min-height: 40px; padding: var(--s-2) var(--s-3); box-sizing: border-box; border: 1px solid var(--sep); border-radius: var(--r-sm); color: var(--text); background: var(--surface); font: inherit; }
    .chef-settings .chef-wide { grid-column: span 3; }
    .chef-save { margin-top: var(--s-3); }

    .chef-loading, .chef-thinking { min-height: 180px; display: flex; align-items: center; justify-content: center; gap: var(--s-4); color: var(--text-2); }
    .chef-thinking { min-height: 120px; margin-top: var(--s-4); border: 1px dashed var(--sep); border-radius: var(--r-lg); }
    .chef-thinking > div:last-child { display: flex; flex-direction: column; gap: var(--s-1); }
    .chef-thinking span { font-size: var(--fs-xs); color: var(--text-3); }
    .chef-onboarding { min-height: 360px; max-width: 560px; margin: var(--s-6) auto; padding: var(--s-7); box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--s-3); text-align: center; background: var(--surface); border: 1px solid var(--sep); border-radius: var(--r-xl); box-shadow: var(--sh-md); }
    .chef-onboarding h2 { margin: 0; font: 700 var(--fs-2xl)/1.15 inherit; }
    .chef-onboarding p { max-width: 470px; margin: 0 0 var(--s-1); color: var(--text-2); line-height: 1.55; }
    .chef-avatar { width: 54px; height: 54px; display: grid; place-items: center; border-radius: var(--r-lg); color: #fff; background: linear-gradient(145deg, var(--brand), #FF5C74); font: 700 var(--fs-lg)/1 inherit; }
    .chef-error { padding: var(--s-2) var(--s-3); border-radius: var(--r-sm); color: var(--brand-hover); background: var(--brand-tint); font-size: var(--fs-xs); }
    .chef-device-code { width: 100%; display: flex; flex-direction: column; align-items: center; gap: var(--s-3); }
    .chef-device-code > strong { padding: var(--s-3) var(--s-5); border: 1px dashed var(--accent); border-radius: var(--r-md); background: var(--accent-light); color: var(--accent); font: 800 25px/1 monospace; letter-spacing: .12em; }
    .chef-device-code > div { display: flex; gap: var(--s-2); }
    .chef-waiting { display: flex; align-items: center; gap: var(--s-2); color: var(--text-3); font-size: var(--fs-xs); }

    .chef-clarification { margin-top: var(--s-4); padding: var(--s-5); display: flex; align-items: center; gap: var(--s-4); border: 1px solid var(--sep); border-radius: var(--r-lg); background: var(--surface); }
    .chef-clarification .chef-avatar { width: 42px; height: 42px; border-radius: var(--r-md); }
    .chef-clarification p { margin: var(--s-1) 0 0; color: var(--text-2); }
    .chef-plan { margin-top: var(--s-4); overflow: hidden; border: 1px solid var(--sep); border-radius: var(--r-xl); background: var(--surface); box-shadow: var(--sh-sm); }
    .chef-plan-head { padding: var(--s-6); display: flex; justify-content: space-between; gap: var(--s-5); background: linear-gradient(135deg, var(--surface), var(--accent-light)); }
    .chef-plan-head > div:first-child { max-width: 720px; }
    .chef-plan h2 { font-size: var(--fs-2xl); }
    .chef-meta { display: flex; align-items: flex-start; gap: var(--s-2); flex-wrap: wrap; justify-content: flex-end; }
    .chef-meta span { padding: var(--s-2) var(--s-2); border-radius: var(--r-pill); color: var(--text-2); background: var(--surface); border: 1px solid var(--sep); font-size: var(--fs-xs); font-weight: 700; }
    .chef-plan-section { padding: var(--s-5) var(--s-6); border-top: 1px solid var(--sep); }
    .chef-plan-section h3 { margin: 0 0 var(--s-1); font: 700 var(--fs-xl)/1.2 inherit; }
    .chef-help { margin: 0 0 var(--s-4); color: var(--text-3); font-size: var(--fs-xs); }
    .chef-ingredients { display: flex; flex-direction: column; gap: var(--s-4); }
    .chef-ingredient { display: grid; grid-template-columns: minmax(160px, .7fr) minmax(0, 2fr); gap: var(--s-4); align-items: start; }
    .chef-ingredient-title { display: flex; gap: var(--s-2); align-items: flex-start; padding-top: var(--s-2); }
    .chef-ingredient-title > span { width: 24px; height: 24px; display: grid; place-items: center; flex: 0 0 24px; border-radius: var(--r-sm); color: var(--accent); background: var(--accent-light); font-size: var(--fs-xs); font-weight: 800; }
    .chef-ingredient-title div { display: flex; flex-direction: column; gap: var(--s-1); }
    .chef-ingredient-title strong { font-size: var(--fs-md); color: var(--text); }
    .chef-ingredient-title small { color: var(--text-3); }
    .chef-ingredient-title button { align-self: flex-start; margin: var(--s-1) 0 0; padding: 0; border: 0; color: var(--accent); background: transparent; font-size: var(--fs-2xs); cursor: pointer; }
    .chef-products { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: var(--s-2); }
    .chef-product { position: relative; min-width: 0; padding: var(--s-2); display: flex; align-items: center; gap: var(--s-2); text-align: left; color: var(--text); background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-md); cursor: pointer; }
    .chef-product:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--sep)); }
    .chef-product--selected { border: 2px solid var(--accent); padding: var(--s-2); background: var(--accent-light); }
    .chef-product-check { position: absolute; right: 7px; top: 7px; width: 18px; height: 18px; display: grid; place-items: center; color: #fff; background: var(--accent); border-radius: 50%; font-size: var(--fs-2xs); }
    .chef-product:not(.chef-product--selected) .chef-product-check { background: transparent; border: 1px solid var(--sep); }
    .chef-product img, .chef-product-placeholder { width: 54px; height: 54px; flex: 0 0 54px; object-fit: contain; border-radius: var(--r-sm); background: #fff; }
    .chef-product-placeholder { display: grid; place-items: center; color: var(--text-3); }
    .chef-product-copy { min-width: 0; display: flex; flex-direction: column; gap: var(--s-1); padding-right: var(--s-4); }
    .chef-product-copy strong { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; font-size: var(--fs-xs); line-height: 1.25; }
    .chef-product-copy small { color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: var(--fs-2xs); }
    .chef-product-copy span { color: var(--text-2); font-size: var(--fs-2xs); }
    .chef-product-copy b { color: var(--accent); font-size: var(--fs-xs); }
    .chef-no-match { padding: var(--s-3); border-radius: var(--r-md); color: var(--text-3); background: var(--surface-2); font-size: var(--fs-xs); }
    .chef-steps ol { margin: var(--s-4) 0 0; padding-left: var(--s-6); display: grid; gap: var(--s-2); color: var(--text-2); line-height: 1.45; }
    .chef-import-bar { position: sticky; bottom: 0; padding: var(--s-3) var(--s-5); display: flex; align-items: center; justify-content: flex-end; gap: var(--s-3); border-top: 1px solid var(--sep); background: color-mix(in srgb, var(--surface) 92%, transparent); backdrop-filter: blur(12px); }
    .chef-import-bar > div { margin-right: auto; display: flex; flex-direction: column; }
    .chef-import-bar > div span { color: var(--text-3); font-size: var(--fs-xs); }

    @media (max-width: 1050px) {
      .chef-products { grid-template-columns: 1fr; }
    }
    @media (max-width: 767px) {
      .chef-view { padding-bottom: 120px; }
      .chef-header, .chef-plan-head { flex-direction: column; }
      .chef-account { width: 100%; flex-wrap: wrap; }
      .chef-settings-grid { grid-template-columns: 1fr; }
      .chef-settings .chef-wide { grid-column: auto; }
      .chef-ingredient { grid-template-columns: 1fr; }
      .chef-plan-section, .chef-plan-head { padding: var(--s-4); }
      .chef-meta { justify-content: flex-start; }
      .chef-import-bar { align-items: stretch; flex-direction: column; }
      .chef-import-bar > div { margin: 0; flex-direction: row; justify-content: space-between; }
      .chef-onboarding { min-height: 300px; margin: var(--s-3) auto; padding: var(--s-6) var(--s-5); }
    }

    /* ── Address Bottom Sheet (mobile) ── */
    .sheet-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(1, 23, 42, .55);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 150ms ease;
    }

    .sheet-card {
      background: var(--surface);
      border-radius: var(--r-xl) var(--r-xl) 0 0;
      width: 100%;
      max-width: 520px;
      display: flex;
      flex-direction: column;
      max-height: 75vh;
      animation: slideUp 220ms cubic-bezier(.22,.68,0,1.2);
      box-shadow: 0 -8px 32px rgba(1, 23, 42, .25);
    }

    .sheet-handle {
      width: 36px;
      height: 4px;
      background: var(--surface-3);
      border-radius: var(--r-pill);
      margin: var(--s-3) auto 0;
      flex-shrink: 0;
    }

    .sheet-header {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      padding: var(--s-4) var(--s-4) var(--s-3);
      border-bottom: 1px solid var(--sep);
      flex-shrink: 0;
    }
    .sheet-title {
      flex: 1;
      font-size: var(--fs-lg);
      font-weight: 700;
      color: var(--text);
    }

    .sheet-body {
      overflow-y: auto;
      flex: 1;
      padding: var(--s-2) 0;
    }

    .sheet-addr-row {
      display: flex;
      align-items: center;
      gap: var(--s-3);
      padding: var(--s-4) var(--s-4);
      cursor: pointer;
      border-radius: 0;
      transition: background 100ms;
    }
    .sheet-addr-row:hover,
    .sheet-addr-row:active { background: var(--surface-2); }

    .sheet-addr-row--active {
      background: var(--accent-light);
    }
    .sheet-addr-row--active .sheet-addr-label { color: var(--accent); font-weight: 700; }
    .sheet-addr-row--active .sheet-addr-icon { color: var(--accent); }

    .sheet-addr-icon { color: var(--text-3); flex-shrink: 0; }
    .sheet-addr-info { flex: 1; min-width: 0; }
    .sheet-addr-label { font-size: var(--fs-md); font-weight: 600; color: var(--text); }
    .sheet-addr-sub { font-size: var(--fs-xs); color: var(--text-3); margin-top: var(--s-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sheet-addr-check { color: var(--accent); flex-shrink: 0; }

    .sheet-empty { padding: var(--s-6) var(--s-4); font-size: var(--fs-md); color: var(--text-3); text-align: center; margin: 0; }

    .sheet-footer {
      padding: var(--s-3) var(--s-4);
      border-top: 1px solid var(--sep);
      flex-shrink: 0;
      padding-bottom: max(16px, env(safe-area-inset-bottom));
    }

    .sheet-add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--s-2);
      width: 100%;
      padding: var(--s-3);
      border: 1.5px dashed var(--sep);
      background: none;
      border-radius: var(--r-md);
      color: var(--text-2);
      font-size: var(--fs-md);
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms;
    }
    .sheet-add-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

    /* ── Mobile bottom navigation ── */
    @media (max-width: 767px) {
      /* Push tab-content up to avoid overlap with bottom nav */
      .tab-content {
        padding-bottom: calc(62px + env(safe-area-inset-bottom, 0px));
      }

      /* Hide top tab-bar on mobile — replaced by bottom nav */
      .tab-bar {
        display: none !important;
      }

      /* The bottom nav is fixed, so the action bar has to clear it. */
      .action-bar {
        margin-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
        padding-bottom: var(--s-3);
      }

      /* Fixed bottom nav bar — iOS style */
      .mobile-bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: calc(56px + env(safe-area-inset-bottom, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background: var(--surface);
        border-top: 1px solid var(--sep);
        display: flex;
        z-index: 100;
        box-shadow: 0 -2px 12px rgba(1, 23, 42, .08);
      }

      .mobile-bottom-nav .tab {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--s-1);
        padding: var(--s-2) var(--s-1);
        background: none;
        border: none;
        border-top: 2px solid transparent;
        color: var(--text-3);
        cursor: pointer;
        font-size: var(--fs-2xs);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        transition: color 150ms, border-color 150ms;
        min-height: 44px;
      }

      .mobile-bottom-nav .tab--active {
        color: var(--accent);
        border-top-color: var(--accent);
      }

      .mobile-bottom-nav .tab-label { font-size: var(--fs-2xs); }
    }

    /* Desktop: hide bottom nav (handled by sidebar) */
    @media (min-width: 768px) {
      .mobile-bottom-nav { display: none !important; }
    }
  `);customElements.get("auchan-grocery-panel")||customElements.define("auchan-grocery-panel",R);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
lit-html/directive.js:
lit-html/directives/unsafe-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
