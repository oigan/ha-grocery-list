var Ie=Object.defineProperty;var Re=(o,e,t)=>e in o?Ie(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var F=(o,e,t)=>Re(o,typeof e!="symbol"?e+"":e,t);var B=window,H=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,V=Symbol(),de=new WeakMap,z=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==V)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(H&&e===void 0){let i=t!==void 0&&t.length===1;i&&(e=de.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&de.set(t,e))}return e}toString(){return this.cssText}},pe=o=>new z(typeof o=="string"?o:o+"",void 0,V),Q=(o,...e)=>{let t=o.length===1?o[0]:e.reduce(((i,a,s)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+o[s+1]),o[0]);return new z(t,o,V)},G=(o,e)=>{H?o.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):e.forEach((t=>{let i=document.createElement("style"),a=B.litNonce;a!==void 0&&i.setAttribute("nonce",a),i.textContent=t.cssText,o.appendChild(i)}))},N=H?o=>o:o=>o instanceof CSSStyleSheet?(e=>{let t="";for(let i of e.cssRules)t+=i.cssText;return pe(t)})(o):o;var Z,O=window,he=O.trustedTypes,je=he?he.emptyScript:"",ue=O.reactiveElementPolyfillSupport,Y={toAttribute(o,e){switch(e){case Boolean:o=o?je:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,e){let t=o;switch(e){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},ge=(o,e)=>e!==o&&(e==e||o==o),W={attribute:!0,type:String,converter:Y,reflect:!1,hasChanged:ge},K="finalized",b=class extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),((t=this.h)!==null&&t!==void 0?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();let e=[];return this.elementProperties.forEach(((t,i)=>{let a=this._$Ep(i,t);a!==void 0&&(this._$Ev.set(a,i),e.push(a))})),e}static createProperty(e,t=W){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){let i=typeof e=="symbol"?Symbol():"__"+e,a=this.getPropertyDescriptor(e,i,t);a!==void 0&&Object.defineProperty(this.prototype,e,a)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(a){let s=this[e];this[t]=a,this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||W}static finalize(){if(this.hasOwnProperty(K))return!1;this[K]=!0;let e=Object.getPrototypeOf(this);if(e.finalize(),e.h!==void 0&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){let t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(let a of i)this.createProperty(a,t[a])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let i=new Set(e.flat(1/0).reverse());for(let a of i)t.unshift(N(a))}else e!==void 0&&t.push(N(e));return t}static _$Ep(e,t){let i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),(e=this.constructor.h)===null||e===void 0||e.forEach((t=>t(this)))}addController(e){var t,i;((t=this._$ES)!==null&&t!==void 0?t:this._$ES=[]).push(e),this.renderRoot!==void 0&&this.isConnected&&((i=e.hostConnected)===null||i===void 0||i.call(e))}removeController(e){var t;(t=this._$ES)===null||t===void 0||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])}))}createRenderRoot(){var e;let t=(e=this.shadowRoot)!==null&&e!==void 0?e:this.attachShadow(this.constructor.shadowRootOptions);return G(t,this.constructor.elementStyles),t}connectedCallback(){var e;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$ES)===null||e===void 0||e.forEach((t=>{var i;return(i=t.hostConnected)===null||i===void 0?void 0:i.call(t)}))}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$ES)===null||e===void 0||e.forEach((t=>{var i;return(i=t.hostDisconnected)===null||i===void 0?void 0:i.call(t)}))}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=W){var a;let s=this.constructor._$Ep(e,i);if(s!==void 0&&i.reflect===!0){let n=(((a=i.converter)===null||a===void 0?void 0:a.toAttribute)!==void 0?i.converter:Y).toAttribute(t,i.type);this._$El=e,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$El=null}}_$AK(e,t){var i;let a=this.constructor,s=a._$Ev.get(e);if(s!==void 0&&this._$El!==s){let n=a.getPropertyOptions(s),l=typeof n.converter=="function"?{fromAttribute:n.converter}:((i=n.converter)===null||i===void 0?void 0:i.fromAttribute)!==void 0?n.converter:Y;this._$El=s,this[s]=l.fromAttribute(t,n.type),this._$El=null}}requestUpdate(e,t,i){let a=!0;e!==void 0&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||ge)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),i.reflect===!0&&this._$El!==e&&(this._$EC===void 0&&(this._$EC=new Map),this._$EC.set(e,i))):a=!1),!this.isUpdatePending&&a&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((a,s)=>this[s]=a)),this._$Ei=void 0);let t=!1,i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),(e=this._$ES)===null||e===void 0||e.forEach((a=>{var s;return(s=a.hostUpdate)===null||s===void 0?void 0:s.call(a)})),this.update(i)):this._$Ek()}catch(a){throw t=!1,this._$Ek(),a}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;(t=this._$ES)===null||t===void 0||t.forEach((i=>{var a;return(a=i.hostUpdated)===null||a===void 0?void 0:a.call(i)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){this._$EC!==void 0&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}};b[K]=!0,b.elementProperties=new Map,b.elementStyles=[],b.shadowRootOptions={mode:"open"},ue?.({ReactiveElement:b}),((Z=O.reactiveElementVersions)!==null&&Z!==void 0?Z:O.reactiveElementVersions=[]).push("1.6.3");var J,q=window,S=q.trustedTypes,fe=S?S.createPolicy("lit-html",{createHTML:o=>o}):void 0,ee="$lit$",_=`lit$${(Math.random()+"").slice(9)}$`,ye="?"+_,De=`<${ye}>`,k=document,P=()=>k.createComment(""),E=o=>o===null||typeof o!="object"&&typeof o!="function",$e=Array.isArray,Be=o=>$e(o)||typeof o?.[Symbol.iterator]=="function",X=`[ 	
\f\r]`,M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ve=/-->/g,me=/>/g,y=RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),be=/'/g,xe=/"/g,ke=/^(?:script|style|textarea|title)$/i,Ae=o=>(e,...t)=>({_$litType$:o,strings:e,values:t}),r=Ae(1),Je=Ae(2),x=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),_e=new WeakMap,$=k.createTreeWalker(k,129,null,!1);function Se(o,e){if(!Array.isArray(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return fe!==void 0?fe.createHTML(e):e}var He=(o,e)=>{let t=o.length-1,i=[],a,s=e===2?"<svg>":"",n=M;for(let l=0;l<t;l++){let h=o[l],c,u,g=-1,v=0;for(;v<h.length&&(n.lastIndex=v,u=n.exec(h),u!==null);)v=n.lastIndex,n===M?u[1]==="!--"?n=ve:u[1]!==void 0?n=me:u[2]!==void 0?(ke.test(u[2])&&(a=RegExp("</"+u[2],"g")),n=y):u[3]!==void 0&&(n=y):n===y?u[0]===">"?(n=a??M,g=-1):u[1]===void 0?g=-2:(g=n.lastIndex-u[2].length,c=u[1],n=u[3]===void 0?y:u[3]==='"'?xe:be):n===xe||n===be?n=y:n===ve||n===me?n=M:(n=y,a=void 0);let m=n===y&&o[l+1].startsWith("/>")?" ":"";s+=n===M?h+De:g>=0?(i.push(c),h.slice(0,g)+ee+h.slice(g)+_+m):h+_+(g===-2?(i.push(void 0),l):m)}return[Se(o,s+(o[t]||"<?>")+(e===2?"</svg>":"")),i]},T=class o{constructor({strings:e,_$litType$:t},i){let a;this.parts=[];let s=0,n=0,l=e.length-1,h=this.parts,[c,u]=He(e,t);if(this.el=o.createElement(c,i),$.currentNode=this.el.content,t===2){let g=this.el.content,v=g.firstChild;v.remove(),g.append(...v.childNodes)}for(;(a=$.nextNode())!==null&&h.length<l;){if(a.nodeType===1){if(a.hasAttributes()){let g=[];for(let v of a.getAttributeNames())if(v.endsWith(ee)||v.startsWith(_)){let m=u[n++];if(g.push(v),m!==void 0){let Te=a.getAttribute(m.toLowerCase()+ee).split(_),D=/([.?@])?(.*)/.exec(m);h.push({type:1,index:s,name:D[2],strings:Te,ctor:D[1]==="."?ie:D[1]==="?"?ae:D[1]==="@"?re:L})}else h.push({type:6,index:s})}for(let v of g)a.removeAttribute(v)}if(ke.test(a.tagName)){let g=a.textContent.split(_),v=g.length-1;if(v>0){a.textContent=S?S.emptyScript:"";for(let m=0;m<v;m++)a.append(g[m],P()),$.nextNode(),h.push({type:2,index:++s});a.append(g[v],P())}}}else if(a.nodeType===8)if(a.data===ye)h.push({type:2,index:s});else{let g=-1;for(;(g=a.data.indexOf(_,g+1))!==-1;)h.push({type:7,index:s}),g+=_.length-1}s++}}static createElement(e,t){let i=k.createElement("template");return i.innerHTML=e,i}};function C(o,e,t=o,i){var a,s,n,l;if(e===x)return e;let h=i!==void 0?(a=t._$Co)===null||a===void 0?void 0:a[i]:t._$Cl,c=E(e)?void 0:e._$litDirective$;return h?.constructor!==c&&((s=h?._$AO)===null||s===void 0||s.call(h,!1),c===void 0?h=void 0:(h=new c(o),h._$AT(o,t,i)),i!==void 0?((n=(l=t)._$Co)!==null&&n!==void 0?n:l._$Co=[])[i]=h:t._$Cl=h),h!==void 0&&(e=C(o,h._$AS(o,e.values),h,i)),e}var te=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;let{el:{content:i},parts:a}=this._$AD,s=((t=e?.creationScope)!==null&&t!==void 0?t:k).importNode(i,!0);$.currentNode=s;let n=$.nextNode(),l=0,h=0,c=a[0];for(;c!==void 0;){if(l===c.index){let u;c.type===2?u=new I(n,n.nextSibling,this,e):c.type===1?u=new c.ctor(n,c.name,c.strings,this,e):c.type===6&&(u=new se(n,this,e)),this._$AV.push(u),c=a[++h]}l!==c?.index&&(n=$.nextNode(),l++)}return $.currentNode=k,s}v(e){let t=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}},I=class o{constructor(e,t,i,a){var s;this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=a,this._$Cp=(s=a?.isConnected)===null||s===void 0||s}get _$AU(){var e,t;return(t=(e=this._$AM)===null||e===void 0?void 0:e._$AU)!==null&&t!==void 0?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=C(this,e,t),E(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==x&&this._(e):e._$litType$!==void 0?this.g(e):e.nodeType!==void 0?this.$(e):Be(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==d&&E(this._$AH)?this._$AA.nextSibling.data=e:this.$(k.createTextNode(e)),this._$AH=e}g(e){var t;let{values:i,_$litType$:a}=e,s=typeof a=="number"?this._$AC(e):(a.el===void 0&&(a.el=T.createElement(Se(a.h,a.h[0]),this.options)),a);if(((t=this._$AH)===null||t===void 0?void 0:t._$AD)===s)this._$AH.v(i);else{let n=new te(s,this),l=n.u(this.options);n.v(i),this.$(l),this._$AH=n}}_$AC(e){let t=_e.get(e.strings);return t===void 0&&_e.set(e.strings,t=new T(e)),t}T(e){$e(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,i,a=0;for(let s of e)a===t.length?t.push(i=new o(this.k(P()),this.k(P()),this,this.options)):i=t[a],i._$AI(s),a++;a<t.length&&(this._$AR(i&&i._$AB.nextSibling,a),t.length=a)}_$AR(e=this._$AA.nextSibling,t){var i;for((i=this._$AP)===null||i===void 0||i.call(this,!1,!0,t);e&&e!==this._$AB;){let a=e.nextSibling;e.remove(),e=a}}setConnected(e){var t;this._$AM===void 0&&(this._$Cp=e,(t=this._$AP)===null||t===void 0||t.call(this,e))}},L=class{constructor(e,t,i,a,s){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=a,this.options=s,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,a){let s=this.strings,n=!1;if(s===void 0)e=C(this,e,t,0),n=!E(e)||e!==this._$AH&&e!==x,n&&(this._$AH=e);else{let l=e,h,c;for(e=s[0],h=0;h<s.length-1;h++)c=C(this,l[i+h],t,h),c===x&&(c=this._$AH[h]),n||(n=!E(c)||c!==this._$AH[h]),c===d?e=d:e!==d&&(e+=(c??"")+s[h+1]),this._$AH[h]=c}n&&!a&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ie=class extends L{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}},Ne=S?S.emptyScript:"",ae=class extends L{constructor(){super(...arguments),this.type=4}j(e){e&&e!==d?this.element.setAttribute(this.name,Ne):this.element.removeAttribute(this.name)}},re=class extends L{constructor(e,t,i,a,s){super(e,t,i,a,s),this.type=5}_$AI(e,t=this){var i;if((e=(i=C(this,e,t,0))!==null&&i!==void 0?i:d)===x)return;let a=this._$AH,s=e===d&&a!==d||e.capture!==a.capture||e.once!==a.once||e.passive!==a.passive,n=e!==d&&(a===d||s);s&&this.element.removeEventListener(this.name,this,a),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;typeof this._$AH=="function"?this._$AH.call((i=(t=this.options)===null||t===void 0?void 0:t.host)!==null&&i!==void 0?i:this.element,e):this._$AH.handleEvent(e)}},se=class{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){C(this,e)}};var we=q.litHtmlPolyfillSupport;we?.(T,I),((J=q.litHtmlVersions)!==null&&J!==void 0?J:q.litHtmlVersions=[]).push("2.8.0");var Ce=(o,e,t)=>{var i,a;let s=(i=t?.renderBefore)!==null&&i!==void 0?i:e,n=s._$litPart$;if(n===void 0){let l=(a=t?.renderBefore)!==null&&a!==void 0?a:null;s._$litPart$=n=new I(e.insertBefore(P(),l),l,void 0,t??{})}return n._$AI(o),n};var ne,oe;var w=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;let i=super.createRenderRoot();return(e=(t=this.renderOptions).renderBefore)!==null&&e!==void 0||(t.renderBefore=i.firstChild),i}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ce(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)===null||e===void 0||e.setConnected(!1)}render(){return x}};w.finalized=!0,w._$litElement$=!0,(ne=globalThis.litElementHydrateSupport)===null||ne===void 0||ne.call(globalThis,{LitElement:w});var Le=globalThis.litElementPolyfillSupport;Le?.({LitElement:w});((oe=globalThis.litElementVersions)!==null&&oe!==void 0?oe:globalThis.litElementVersions=[]).push("3.3.3");var ze={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Me=o=>(...e)=>({_$litDirective$:o,values:e}),U=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};var R=class extends U{constructor(e){if(super(e),this.et=d,e.type!==ze.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===d||e==null)return this.ft=void 0,this.et=e;if(e===x)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.et)return this.ft;this.et=e;let t=[e];return t.raw=t,this.ft={_$litType$:this.constructor.resultType,strings:t,values:[]}}};R.directiveName="unsafeHTML",R.resultType=1;var Pe=Me(R);var Oe="auchan_grocery",f="/api/auchan_grocery",qe=350,Ue={cart:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.925-7.125a60.914 60.914 0 0 0-18.786-1.002c-.355-.013-.704.015-1.05.04A3.75 3.75 0 0 0 3.636 8.25M7.5 14.25 5.106 5.272M7.5 14.25l-1.5 1.5M18 18.75a3 3 0 0 1-3-3m0 0a3 3 0 0 1-3-3m3 3h.008v.008H15v-.008Z"/></svg>',search:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>',map:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/></svg>',recipes:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.872c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5M3.75 13.121c.626-2.562 2.99-4.372 5.752-4.372h5c2.762 0 5.126 1.81 5.752 4.372m-3.752.13v4.5m-9.25-4.5v4.5M12 21v-4.5m-3.75 4.5h7.5"/></svg>',dashboard:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>',pin:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>',starFill:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>',xmark:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>',chevron:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>',alert:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>',clipboard:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/></svg>',arrowUp:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"/></svg>',wrench:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>',refresh:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>',chevronLeft:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>',qr:'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75V4.5Zm11.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75h-3.75a.75.75 0 0 1-.75-.75V4.5Zm-11.25 11.25A.75.75 0 0 1 4.5 15h3.75a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75v-3.75ZM15 15h2.25v2.25H15V15Zm3.75 0h1.5v5.25h-5.25v-1.5h3.75V15Z"/></svg>'};function p(o,e=20){return r`<span class="icon" style="width:${e}px;height:${e}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${Pe(Ue[o]||"")}</span>`}function Ee(o,e){let t,i=(...a)=>{clearTimeout(t),t=setTimeout(()=>o(...a),e)};return i.cancel=()=>clearTimeout(t),i}function A(o){return!o||o===0?"\u2014":Number(o).toFixed(2)+" RON"}function Fe(o){return{available:{color:"#34C759",label:"Disponibil"},withoutStock:{color:"#FF453A",label:"Epuizat"},withoutPriceFulfillment:{color:"#FF453A",label:"Indisponibil"},withoutSearchSelection:{color:"#FF9F0A",label:"Indisponibil \xEEn zon\u0103"},cannotBeHandled:{color:"#FF9F0A",label:"Indisponibil \xEEn zon\u0103"}}[o]||{color:"#98989D",label:o||"Necunoscut"}}var Ve="/auchan_grocery_static/vendor/qrcode.min.js";async function Qe(o){return new Promise((e,t)=>{if(document.querySelector(`script[src="${o}"]`)){e();return}let i=document.createElement("script");i.src=o,i.onload=e,i.onerror=t,document.head.appendChild(i)})}var ce=class{constructor(e){this._hass=e}async _request(e,t,i){let a=t.replace(/^\/api\//,"");return this._hass.callApi(e,a,i)}async callService(e,t={}){return this._hass.callService(Oe,e,t)}async getLists(){return this._request("GET",`${f}/lists`)}async search(e,t){return this._request("GET",`${f}/search?q=${encodeURIComponent(e)}&list_id=${encodeURIComponent(t||"")}`)}async getPickupPoints(e,t){return this._request("GET",`${f}/pickup?lat=${e}&lng=${t}`)}async getRecipes(){return this._request("GET",`${f}/recipes`)}async getChefStatus(){return this._request("GET",`${f}/chef/status`)}async startChefLogin(){return this._request("POST",`${f}/chef/login`,{})}async getChefLoginStatus(e){return this._request("GET",`${f}/chef/login/${encodeURIComponent(e)}`)}async logoutChef(){return this._request("POST",`${f}/chef/logout`,{})}async getChefPreferences(){return this._request("GET",`${f}/chef/preferences`)}async saveChefPreferences(e){return this._request("PUT",`${f}/chef/preferences`,e)}async createChefPlan(e,t=null){return this._request("POST",`${f}/chef/plan`,{prompt:e,thread_id:t||void 0})}async importChefProducts(e){return this._request("POST",`${f}/chef/import`,e)}async getAddresses(){return this._request("GET",`${f}/addresses`)}async addAddress(e,t,i,a,s=""){return this._request("POST",`${f}/addresses`,{label:e,display_name:t,latitude:i,longitude:a,postal_code:s,set_active:!0})}async deleteAddress(e){return await this._request("DELETE",`${f}/addresses/${encodeURIComponent(e)}`),!0}async activateAddress(e){return this._request("POST",`${f}/addresses/${encodeURIComponent(e)}/activate`,{})}async geocode(e){return this._request("GET",`${f}/geocode?q=${encodeURIComponent(e)}`)}async getRegionInfo(e=!1){return this._request("GET",`${f}/region${e?"?force=1":""}`)}async resolveRegion(e,t){return this._request("GET",`${f}/region_resolve?lat=${e}&lng=${t}`)}async getJson(e){return this._request("GET",e)}async postJson(e,t){return this._request("POST",e,t)}},le=class{constructor(e){this._panel=e,this._resolve=null}async confirm(e,t=!1){return new Promise(i=>{this._resolve=i,this._panel._dialog={type:"confirm",message:e,destructive:t}})}async prompt(e,t=""){return new Promise(i=>{this._resolve=i,this._panel._dialog={type:"prompt",message:e,placeholder:t,value:""}})}respond(e){this._resolve&&(this._resolve(e),this._resolve=null,this._panel._dialog=null)}},j=class extends w{constructor(){super(),this._lists=[],this._activeListId=null,this._searchQuery="",this._searchResults=[],this._pickupPoints=[],this._addresses=[],this._loading=!0,this._searchLoading=!1,this._notification=null,this._showQr=!1,this._qrUrl="",this._tab="dashboard",this._api=null,this._recipes=[],this._recipesLoading=!1,this._showAddressModal=!1,this._showAddressSheet=!1,this._addrQuery="",this._addrSuggestions=[],this._addrLabel="Acas\u0103",this._addrSelected=null,this._addrLoading=!1,this._regionInfo=null,this._showDiagnostics=!1,this._dialog=null,this._dialogValue="",this._sortBy="added",this._filterCategory="",this._isMobile=window.innerWidth<768,this._searchDebounced=Ee(this._doSearch.bind(this),qe),this._addrDebounced=Ee(this._doAddrSearch.bind(this),400),this._dialogMgr=new le(this),this._pickupPointsLoading=!1,this._busyActions={},this._recipeModalData=null,this._recipeImportListId=null,this._chefStatus=null,this._chefStatusLoading=!1,this._chefLogin=null,this._chefPrompt="",this._chefPlan=null,this._chefThreadId="",this._chefSelected={},this._chefPreferences={household_size:2,budget:"mediu",max_time_minutes:45,dietary:[],dislikes:"",pantry:"",loyalty_card_alias:""},this._chefSettingsOpen=!1,this._chefGenerating=!1,this._chefImporting=!1,this._chefTargetListId="",this._timers=new Set,this._mapChannel=crypto.randomUUID(),this._resizeObserver=new ResizeObserver(e=>{this._isMobile=e[0].contentRect.width<768})}connectedCallback(){super.connectedCallback(),this._resizeObserver.observe(this),this._onMapMessage=this._handleMapMessage.bind(this),window.addEventListener("message",this._onMapMessage)}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver.disconnect(),window.removeEventListener("message",this._onMapMessage),this._searchDebounced.cancel(),this._addrDebounced.cancel(),this._timers.forEach(e=>clearTimeout(e)),this._timers.clear()}_schedule(e,t){let i=setTimeout(()=>{this._timers.delete(i),e()},t);return this._timers.add(i),i}async _runAction(e,t,i=""){if(this._busyActions[e])return null;this._busyActions={...this._busyActions,[e]:!0};try{let a=await t();return i&&this._showToast(i,"success"),a}catch(a){return console.error(`[AuchanPanel] ${e} failed`,a),this._showToast("Ac\u021Biunea nu a putut fi finalizat\u0103. \xCEncearc\u0103 din nou.","error"),null}finally{let{[e]:a,...s}=this._busyActions;this._busyActions=s}}async _handleMapMessage(e){let t=this.shadowRoot?.querySelector("#leaflet-iframe");if(e.source!==t?.contentWindow||e.data?.channel!==this._mapChannel)return;let{type:i,lat:a,lng:s,name:n}=e.data||{},l=Number(a),h=Number(s);if(!(!i||!Number.isFinite(l)||!Number.isFinite(h))&&!(l<43.5||l>48.3||h<20||h>30)){if(i==="map_click"){let c=await this._runAction("map-region",()=>this._api?.resolveRegion(l,h));if(!c||!c.all_sellers?.length){this._showToast("Niciun magazin Auchan g\u0103sit \xEEn aceast\u0103 zon\u0103","warning");return}let u=c.all_sellers.map(g=>({lat:l,lng:h,name:g.name||g.id,desc:g.id}));t?.contentWindow?.postMessage({type:"explore_stores",stores:u,channel:this._mapChannel},"*"),this._showToast(`${u.length} magazin(e) g\u0103site \xEEn zon\u0103`,"success")}if(i==="store_set_active"){let c=this._addresses.find(u=>Math.abs(u.latitude-l)<.001&&Math.abs(u.longitude-h)<.001);if(c){if(!await this._runAction(`map-address:${c.id}`,()=>this._api?.activateAddress(c.id)))return;await this._loadAddresses(),this._showToast(`${n||"Magazin"} setat ca adres\u0103 activ\u0103 \u2713`,"success")}else{let u=n||"Adres\u0103 magazin";if(!await this._runAction("map-address:new",()=>this._api?.addAddress(u,n||"Magazin Auchan",l,h)))return;await this._loadAddresses(),this._showToast(`${u} setat ca adres\u0103 activ\u0103 \u2713`,"success")}}if(i==="store_save_new"){let c=await this._dialogMgr.prompt(`Etichet\u0103 pentru ${n||"magazin"}:`,n||"Magazin Auchan");if(!c||!await this._runAction("map-address:save",()=>this._api?.addAddress(c,n||"Magazin Auchan",l,h)))return;await this._loadAddresses(),this._showToast(`"${c}" salvat \u2713`,"success")}}}updated(e){let t=!1;e.has("hass")&&this.hass&&(this._api?this._api._hass=this.hass:(this._api=new ce(this.hass),t=!0),t&&(this._loadData(),this._loadAddresses(),this._loadPickupPoints())),e.has("_tab")&&(this._tab==="map"&&this._pickupPoints.length===0&&this._loadPickupPoints(),this._tab==="recipes"&&!this._chefStatus&&this._loadChef())}async _loadData(){this._loading=!0;try{let e=await this._api?.getLists()||[];this._lists=e,e.some(t=>t.id===this._activeListId)||(this._activeListId=e.find(t=>t.is_active)?.id||e[0]?.id||null)}catch(e){console.error("[AuchanPanel] loadData:",e),this._showToast("Listele nu au putut fi \xEEnc\u0103rcate.","error")}this._loading=!1}async _loadAddresses(){if(this._api)try{this._addresses=await this._api.getAddresses()}catch(e){console.error("[AuchanPanel] addresses failed",e),this._showToast("Adresele nu au putut fi \xEEnc\u0103rcate.","error")}}async _loadPickupPoints(){if(!this._api)return;this._pickupPointsLoading=!0;let e=this._addresses?.find(a=>a.is_active),t=e?.latitude||this.hass?.config?.latitude||44.4195,i=e?.longitude||this.hass?.config?.longitude||26.1776;try{this._pickupPoints=await this._api.getPickupPoints(t,i)}catch(a){console.error("[AuchanPanel] pickup points failed",a),this._showToast("Magazinele nu au putut fi \xEEnc\u0103rcate.","error")}this._pickupPointsLoading=!1}async _loadRecipes(){if(this._api){this._recipesLoading=!0;try{this._recipes=await this._api.getRecipes()}catch(e){console.error("[AuchanPanel] recipes failed",e),this._showToast("Re\u021Betele nu au putut fi \xEEnc\u0103rcate.","error")}this._recipesLoading=!1}}async _loadChef(){if(!this._api||this._chefStatusLoading)return;this._chefStatusLoading=!0;let[e,t]=await Promise.allSettled([this._api.getChefStatus(),this._api.getChefPreferences()]);e.status==="fulfilled"?this._chefStatus=e.value:(console.error("[AuchanPanel] chef status failed",e.reason),this._chefStatus={configured:!0,connected:!1,error:"Serviciul Chef AI nu r\u0103spunde. Verific\u0103 adresa bridge-ului."}),t.status==="fulfilled"&&(this._chefPreferences={...this._chefPreferences,...t.value}),this._chefTargetListId||(this._chefTargetListId=this._activeListId||"new"),this._chefStatusLoading=!1}async _loadLists(){await this._loadData()}_onSearchInput(e){this._searchQuery=e.target.value,this._searchQuery.length>=2?this._searchDebounced():this._searchResults=[]}async _doSearch(){if(!(!this._api||!this._searchQuery||this._searchQuery.length<2)){this._searchLoading=!0;try{this._searchResults=await this._api.search(this._searchQuery,this._activeListId)}catch(e){console.error("[AuchanPanel] search failed",e),this._searchResults=[],this._showToast("C\u0103utarea nu este disponibil\u0103 momentan.","error")}this._searchLoading=!1}}_clearSearch(){this._searchQuery="",this._searchResults=[];let e=this.shadowRoot?.querySelector("#search-input");e&&(e.value="")}_openAddressModal(){if(this._isMobile){this._showAddressSheet=!0;return}this._showAddressModal=!0,this._addrQuery="",this._addrSuggestions=[],this._addrSelected=null,this._addrLabel="Acas\u0103"}_openAddAddressModal(){this._showAddressSheet=!1,this._showAddressModal=!0,this._addrQuery="",this._addrSuggestions=[],this._addrSelected=null,this._addrLabel="Acas\u0103"}_closeAddressModal(){this._showAddressModal=!1}_onAddrInput(e){this._addrQuery=e.target.value,this._addrSelected=null,this._addrQuery.length>=3?this._addrDebounced():this._addrSuggestions=[]}async _doAddrSearch(){!this._api||this._addrQuery.length<3||(this._addrLoading=!0,this._addrSuggestions=await this._api.geocode(this._addrQuery).catch(()=>[]),this._addrLoading=!1)}_selectAddrSuggestion(e){this._addrSelected=e,this._addrQuery=e.display_name,this._addrSuggestions=[]}async _saveAddress(){if(!this._addrSelected||!this._api)return;this._addrLoading=!0;let e=null;try{e=await this._api.addAddress(this._addrLabel,this._addrSelected.display_name,this._addrSelected.latitude,this._addrSelected.longitude,this._addrSelected.postal_code||"")}catch(t){console.error("[AuchanPanel] address save failed",t)}finally{this._addrLoading=!1}e?(this._showToast(`Adres\u0103 "${this._addrLabel}" salvat\u0103!`,"success"),await this._loadAddresses(),this._closeAddressModal()):this._showToast("Eroare la salvarea adresei","error")}async _activateAddress(e){!this._api||!await this._runAction(`address:${e}`,()=>this._api.activateAddress(e))||(await this._loadAddresses(),await this._loadLists(),this._pickupPoints=[],this._regionInfo=await this._api.getRegionInfo(!0).catch(()=>null),this._showToast("Adres\u0103 activat\u0103! Se actualizeaz\u0103 stocurile...","info"),this._schedule(async()=>{await this._loadLists(),this._showToast("Stocuri actualizate pentru adresa selectat\u0103 \u2713","success")},7e3))}async _deleteAddress(e,t){!await this._dialogMgr.confirm(`\u0218tergi adresa "${t}"?`,!0)||!await this._runAction(`delete-address:${e}`,()=>this._api?.deleteAddress(e))||(await this._loadAddresses(),this._showToast("Adres\u0103 \u0219tears\u0103","info"))}async _addSearchResult(e){!this._activeListId||!this._api||await this._runAction(`add:${e.sku_id}`,()=>this._api.callService("add_item",{list_id:this._activeListId,sku_id:e.sku_id,product_id:e.product_id,name:e.name,brand:e.brand||"",quantity:1,price:e.price||0,list_price:e.list_price||0,image_url:e.image_url||"",category:e.category||"",url:e.url||"",description:e.description||"",seller_id:e.seller_id||"1"}),`"${e.name}" ad\u0103ugat \xEEn list\u0103!`)===null||(this._clearSearch(),await this._loadData())}async _toggleCart(e,t){await this._runAction(`cart:${e}:${t}`,()=>this._api?.callService("toggle_in_cart",{list_id:e,sku_id:t}))!==null&&await this._loadData()}async _toggleWatch(e,t){await this._runAction(`watch:${e}:${t}`,()=>this._api?.callService("toggle_watch",{list_id:e,sku_id:t}))!==null&&await this._loadData()}async _removeItem(e,t,i){!await this._dialogMgr.confirm(`Elimini "${i}" din list\u0103?`,!0)||await this._runAction(`remove:${e}:${t}`,()=>this._api?.callService("remove_item",{list_id:e,sku_id:t}))===null||await this._loadData()}async _updateQty(e,t,i,a){let s=Math.max(0,a+i);await this._runAction(`quantity:${e}:${t}`,()=>this._api?.callService("set_item_quantity",{list_id:e,sku_id:t,quantity:s}))!==null&&(s===0&&this._showToast("Produs eliminat din list\u0103","info"),await this._loadData())}async _createList(){let e=await this._dialogMgr.prompt("Nume list\u0103 nou\u0103:","ex: Cump\u0103r\u0103turi S\u0103pt\u0103m\xE2n\u0103");if(e===null)return;let t=(e||"").trim()||"Lista "+new Date().toLocaleDateString("ro-RO");await this._runAction("create-list",()=>this._api?.callService("create_list",{name:t}),`Lista "${t}" creat\u0103!`)!==null&&await this._loadData()}async _generateCartLink(){let e=this._activeList;if(!e)return;let t=(e.items||[]).filter(s=>s.in_cart!==!1);if(t.length===0){this._showToast("Bifeaz\u0103 cel pu\u021Bin un produs pentru co\u0219.","warning");return}let i=new URLSearchParams;for(let s of t)i.append("sku",s.sku_id),i.append("qty",String(s.quantity||1)),i.append("seller",s.seller_id||"1");i.set("sc","1");let a=`https://www.auchan.ro/checkout/cart/add?${i.toString()}`;this._qrUrl=a,this._showQr=!0,await this._renderQr(a)}async _renderQr(e){await Qe(Ve),await this.updateComplete;let t=this.shadowRoot?.querySelector("#qr-container");if(t){t.innerHTML="";try{new window.QRCode(t,{text:e,width:200,height:200,colorDark:"#000000",colorLight:"#ffffff",correctLevel:window.QRCode.CorrectLevel.M})}catch{t.textContent=e}}}async _addRecipeIngredients(e){if(!this._activeListId||!e.ingredients?.length)return;let t=0,i=0;for(let a of e.ingredients)if(a.name){try{await this._api.callService("search_and_add",{list_id:this._activeListId,query:a.name,quantity:1,auto_add_first:!0}),t++}catch(s){i++,console.error("[AuchanPanel] ingredient import failed",s)}if(t+i>=10)break}this._showToast(i?`${t} ingrediente ad\u0103ugate, ${i} nu au putut fi ad\u0103ugate.`:`${t} ingrediente din "${e.title}" ad\u0103ugate!`,i?"warning":"success"),await this._loadData()}async _selectPickupStore(e){if(!this._api)return;let t=`Magazin ${e.name}`,i=[e.address,e.city].filter(Boolean).join(" \xB7 ");await this._runAction(`pickup-address:${e.id||e.name}`,()=>this._api.addAddress(t,i,e.latitude,e.longitude,e.postal_code||""))&&(await this._loadAddresses(),this._showToast(`Setat ca loca\u021Bie: ${e.name}`,"success"),this._tab="list")}_flyToStore(e){if(!e.latitude||!e.longitude)return;let t=this.shadowRoot?.querySelector("#leaflet-iframe");t?.contentWindow&&t.contentWindow.postMessage({type:"fly",lat:e.latitude,lng:e.longitude,channel:this._mapChannel},"*")}_showToast(e,t="info"){this._notification={message:e,type:t},this._schedule(()=>{this._notification=null},3500)}async _selectList(e){if(!e||e===this._activeListId)return;let t=this._activeListId;this._activeListId=e,this._filterCategory="",await this._runAction("select-list",()=>this._api?.callService("set_active_list",{list_id:e}))===null&&(this._activeListId=t)}_renderDialog(){if(!this._dialog)return d;let e=this._dialog;return r`
      <div class="dialog-overlay" @click=${()=>this._dialogMgr.respond(null)}>
        <div class="dialog-sheet" @click=${t=>t.stopPropagation()}>
          <p class="dialog-message">${e.message}</p>
          ${e.type==="prompt"?r`
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
    `}get _activeList(){let e=this._lists||[];return e.find(t=>t.id===this._activeListId)||e[0]||null}get _activeItems(){let e=[...this._activeList?.items||[]];switch(this._filterCategory&&(e=e.filter(t=>t.category===this._filterCategory)),this._sortBy){case"price_asc":return e.sort((t,i)=>(t.current_price||0)-(i.current_price||0));case"price_desc":return e.sort((t,i)=>(i.current_price||0)-(t.current_price||0));case"name":return e.sort((t,i)=>(t.name||"").localeCompare(i.name||""));default:return e}}get _categories(){return[...new Set((this._activeList?.items||[]).map(t=>t.category).filter(Boolean))]}get _cartTotal(){return(this._activeList?.items||[]).filter(e=>e.in_cart!==!1).reduce((e,t)=>e+(t.current_price||t.price_when_added||0)*(t.quantity||1),0)}get _cartSavings(){return(this._activeList?.items||[]).filter(e=>e.in_cart!==!1&&e.list_price>e.current_price).reduce((e,t)=>e+(t.list_price-t.current_price)*(t.quantity||1),0)}render(){let e=!this._isMobile;return r`
      ${this._renderToast()}
      ${this._renderDialog()}
      <div class="panel-root ${e?"panel-root--desktop":""}">
        ${this._renderHeader()}
        <div class="search-wrap">
          ${this._renderSearch()}
          ${this._renderSearchResults()}
        </div>
        ${e?r`
          <div class="desktop-layout">
            <aside class="sidebar">${this._renderSidebar()}</aside>
            <main class="main-content">
              ${this._renderTabs()}
              <div class="tab-content">${this._renderActiveTab()}</div>
              ${this._renderActionBar()}
            </main>
          </div>
        `:r`
          <div class="tab-content">${this._renderActiveTab()}</div>
          ${this._renderActionBar()}
          ${this._renderMobileBottomNav()}
        `}
        ${this._showQr?this._renderQrModal():d}
        ${this._showAddressModal?this._renderAddressModal():d}
        ${this._showAddressSheet?this._renderAddressSheet():d}
      </div>
    `}_renderActiveTab(){switch(this._tab){case"dashboard":return this._renderDashboardView();case"list":return this._renderListView();case"map":return this._renderMapView();case"recipes":return this._renderRecipesView()}}_renderToast(){if(!this._notification)return d;let{message:e,type:t}=this._notification;return r`<div class="toast toast--${t}" role="alert">${e}</div>`}_renderHeader(){let e=this._addresses||[],t=this._lists||[],a=e.find(n=>n.is_active)?.label||"F\u0103r\u0103 adres\u0103",s=this._activeList;return r`
      <header class="panel-header" role="banner">
        <!-- HA Home / Back button -->
        <button class="hdr-home-btn"
          @click=${()=>{window.history.length>1?window.history.back():window.location.href="/"}}
          title="Înapoi la tabloul de bord HA"
          aria-label="Înapoi la tabloul de bord Home Assistant">
          ${p("home",18)}
        </button>

        <!-- Brand -->
        <div class="header-brand" aria-label="Auchan Grocery">
          <div class="brand-icon">${p("cart",16)}</div>
          <span class="brand-name">Auchan <small>Grocery</small></span>
        </div>

        <!-- Address pill -->
        <button class="header-pill" @click=${this._openAddressModal}
          title="Gestionează adrese"
          aria-label="Adresă activă: ${a}">
          ${p("pin",13)}
          <span class="pill-label">${a}</span>
          ${p("chevron",10)}
        </button>

        <!-- List selector -->
        <div class="header-list-wrap">
          ${p("list",13)}
          <select class="header-select"
            @change=${n=>this._selectList(n.target.value)}
            aria-label="Listă activă">
            ${t.map(n=>r`
              <option value=${n.id} ?selected=${n.id===this._activeListId}>${n.name||n.id}</option>
            `)}
          </select>
        </div>

        <!-- Right actions -->
        <div class="header-actions">
          <button class="hdr-btn" @click=${this._createList}
            title="Listă nouă" aria-label="Crează listă nouă">
            ${p("plus",16)}
          </button>
          <button class="hdr-btn hdr-btn--diag ${this._showDiagnostics?"hdr-btn--active":""}"
            @click=${()=>{this._showDiagnostics=!this._showDiagnostics,this._showDiagnostics&&!this._regionInfo&&this._api?.getRegionInfo().then(n=>this._regionInfo=n)}}
            title="Diagnostice" aria-label="Diagnostice">
            ${p("wrench",15)}
          </button>
        </div>
      </header>
      ${this._showDiagnostics?this._renderDiagnostics():d}
    `}_renderDiagnostics(){let e=this._regionInfo,t=this._addresses?.find(a=>a.is_active),i=t?.region_id||e?.region_id;return r`
      <div class="diagnostics">
        <div class="diag-row">
          <span class="diag-label">Region ID</span>
          <code class="diag-val ${i?"":"diag-val--missing"}">
            ${i||"\u274C lips\u0103 \u2014 apas\u0103 \u21BA Refresh"}
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
    `}_renderSearch(){return r`
      <div class="search-bar" role="search">
        <span class="search-icon">${p("search",18)}</span>
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
        ${this._searchLoading?r`<div class="spinner" aria-label="Se caută..."></div>`:d}
        ${this._searchQuery?r`
          <button class="search-clear" @click=${this._clearSearch} aria-label="Șterge căutarea">
            ${p("xmark",16)}
          </button>
        `:d}
      </div>
    `}_renderSearchResults(){return!this._searchResults?.length&&!this._searchLoading?d:this._searchLoading&&!this._searchResults?.length?r`
        <div class="search-results">
          ${[1,2,3].map(()=>r`<div class="search-skeleton"></div>`)}
        </div>
      `:r`
      <div class="search-results" role="list" aria-label="Rezultate căutare">
        ${this._searchResults.map(e=>r`
          <div class="search-row" role="listitem">
            ${e.image_url?r`
              <img class="search-thumb" src=${e.image_url} alt="" loading="lazy" referrerpolicy="no-referrer"
                   @error=${t=>t.target.style.display="none"} />
            `:r`<div class="search-thumb search-thumb--placeholder"></div>`}
            <div class="search-info">
              <span class="search-name">${e.name}</span>
              ${e.brand?r`<span class="search-brand">${e.brand}</span>`:d}
            </div>
            <div class="search-price-col">
              <span class="search-price">${A(e.price)}</span>
              ${e.discount_pct>0?r`<span class="search-discount">-${e.discount_pct}%</span>`:d}
            </div>
            <button class="search-add-btn" aria-label="Adaugă ${e.name}"
              ?disabled=${!!this._busyActions[`add:${e.sku_id}`]}
              @click=${()=>this._addSearchResult(e)}>
              ${this._busyActions[`add:${e.sku_id}`]?r`<div class="spinner spinner--sm"></div>`:p("plus",16)}
            </button>
          </div>
        `)}
      </div>
    `}_renderSidebar(){let e=this._lists||[],t=this._addresses||[];return r`
      <nav class="sidebar-nav" aria-label="Navigare">
        <div class="sidebar-section">
          <h3 class="sidebar-heading">Liste</h3>
          ${e.map(i=>r`
            <button class="sidebar-item ${i.id===this._activeListId?"sidebar-item--active":""}"
              @click=${()=>this._selectList(i.id)}>
              ${p("list",16)}
              <span>${i.name||i.id}</span>
              <span class="sidebar-count">${i.item_count??i.items?.length??0}</span>
            </button>
          `)}
          <button class="sidebar-add-btn" @click=${this._createList}>
            ${p("plus",14)} Listă nouă
          </button>
        </div>
        <div class="sidebar-section">
          <h3 class="sidebar-heading">Adrese</h3>
          ${t.map(i=>r`
            <div class="sidebar-addr ${i.is_active?"sidebar-addr--active":""}">
              <button class="sidebar-addr-main" @click=${()=>this._activateAddress(i.id)}>
                ${p("pin",14)}
                <span>${i.label}</span>
                ${i.is_active?r`<span class="dot-active"></span>`:d}
              </button>
              <button class="sidebar-addr-del" @click=${()=>this._deleteAddress(i.id,i.label)}
                aria-label="Șterge adresa ${i.label}">
                ${p("trash",14)}
              </button>
            </div>
          `)}
          <button class="sidebar-add-btn" @click=${this._openAddressModal}>
            ${p("plus",14)} Adresă nouă
          </button>
        </div>
      </nav>
    `}_renderTabs(){return r`
      <nav class="tab-bar" role="tablist" aria-label="Secțiuni">
        ${[{id:"dashboard",icon:"dashboard",label:"Tablou"},{id:"list",icon:"list",label:"List\u0103"},{id:"map",icon:"map",label:"Hart\u0103"},{id:"recipes",icon:"recipes",label:"Chef AI"}].map(t=>r`
          <button
            class="tab ${this._tab===t.id?"tab--active":""}"
            role="tab"
            aria-selected=${this._tab===t.id}
            @click=${()=>{this._tab=t.id}}
            id="tab-${t.id}">
            ${p(t.icon,20)}
            <span class="tab-label">${t.label}</span>
          </button>
        `)}
      </nav>
    `}_renderMobileBottomNav(){return r`
      <nav class="mobile-bottom-nav" role="tablist" aria-label="Navigare">
        ${[{id:"dashboard",icon:"dashboard",label:"Tablou"},{id:"list",icon:"list",label:"List\u0103"},{id:"map",icon:"map",label:"Hart\u0103"},{id:"recipes",icon:"recipes",label:"Chef AI"}].map(t=>r`
          <button
            class="tab ${this._tab===t.id?"tab--active":""}"
            role="tab"
            aria-selected=${this._tab===t.id}
            @click=${()=>{this._tab=t.id}}
            id="mob-tab-${t.id}">
            ${p(t.icon,22)}
            <span class="tab-label">${t.label}</span>
          </button>
        `)}
      </nav>
    `}_renderDashboardView(){let e=this._activeList,t=e?.items||[],i=t.filter(c=>c.in_cart!==!1),a=t.filter(c=>{let u=c.availability;return!u||u==="withoutStock"||u==="withoutPriceFulfillment"||u==="withoutSearchSelection"||u==="cannotBeHandled"}),s=t.filter(c=>c.watch||c.watch_price||c.watch_stock),n=this._cartSavings,l={};t.forEach(c=>{c.category&&(l[c.category]=(l[c.category]||0)+1)});let h=Object.entries(l).sort((c,u)=>u[1]-c[1]).slice(0,4);return e?r`
      <div class="dash">
        <!-- Hero Card -->
        <div class="dash-hero">
          <div class="dash-hero-left">
            <h2 class="dash-list-name">${e.name||e.id}</h2>
          </div>
          <div class="dash-hero-right">
            <span class="dash-total-label">Total coș</span>
            <span class="dash-total-val">${A(this._cartTotal)}</span>
            ${n>.01?r`
              <span class="dash-chip dash-chip--green">Economii ${A(n)}</span>
            `:d}
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="bento">
          <button class="bento-card stat-card" @click=${()=>{this._tab="list",this._filterCategory=""}}>
            <div class="stat-icon stat-icon--blue">${p("list",22)}</div>
            <div class="stat-body">
              <span class="stat-num">${i.length}</span>
              <span class="stat-name">În coș</span>
            </div>
          </button>

          <button class="bento-card stat-card" @click=${()=>this._tab="list"}>
            <div class="stat-icon stat-icon--orange">${p("eye",22)}</div>
            <div class="stat-body">
              <span class="stat-num">${s.length}</span>
              <span class="stat-name">Monitorizate</span>
            </div>
          </button>

          <button class="bento-card stat-card ${a.length>0?"stat-card--alert":""}"
            @click=${()=>this._tab="list"}>
            <div class="stat-icon stat-icon--red">${p("alert",22)}</div>
            <div class="stat-body">
              <span class="stat-num">${a.length}</span>
              <span class="stat-name">Epuizate</span>
            </div>
          </button>

          <button class="bento-card stat-card" @click=${()=>this._tab="map"}>
            <div class="stat-icon stat-icon--green">${p("pin",22)}</div>
            <div class="stat-body">
              <span class="stat-num">${this._pickupPoints.length||"\u2014"}</span>
              <span class="stat-name">Magazine</span>
            </div>
          </button>
        </div>

        <!-- Categories -->
        ${h.length>0?r`
          <div class="bento-card">
            <h4 class="card-section-title">Categorii</h4>
            ${h.map(([c,u])=>r`
              <button class="cat-row" @click=${()=>{this._tab="list",this._filterCategory=c}}>
                <span class="cat-name">${c}</span>
                <span class="cat-badge">${u}</span>
              </button>
            `)}
          </div>
        `:d}
      </div>
    `:r`
      <div class="empty-state">
        ${p("list",48)}
        <h3>Nicio listă</h3>
        <p>Creează o listă nouă pentru a începe</p>
        <button class="primary-btn" @click=${this._createList}>${p("plus",16)} Listă nouă</button>
      </div>
    `}_renderListView(){if(this._loading)return this._renderSkeleton();let e=this._activeItems,t=this._categories;return r`
      <div class="list-view">
        <!-- Filters row -->
        <div class="filter-bar">
          <div class="filter-chips">
            <button class="filter-chip ${this._filterCategory?"":"filter-chip--active"}"
              @click=${()=>this._filterCategory=""}>
              Toate (${this._activeList?.items?.length||0})
            </button>
            ${t.map(i=>r`
              <button class="filter-chip ${this._filterCategory===i?"filter-chip--active":""}"
                @click=${()=>this._filterCategory=i}>
                ${i}
              </button>
            `)}
          </div>
          <select class="sort-select" @change=${i=>this._sortBy=i.target.value} aria-label="Sortare">
            <option value="added">Ordine adăugare</option>
            <option value="name">Alfabetic</option>
            <option value="price_asc">Preț crescător</option>
            <option value="price_desc">Preț descrescător</option>
          </select>
        </div>

        <!-- Product list -->
        ${e.length===0?r`
          <div class="empty-state">
            ${p("cart",48)}
            <h3>Lista e goală</h3>
            <p>Caută produse în bara de sus pentru a le adăuga</p>
          </div>
        `:r`
          <ul class="product-list" role="list">
            ${e.map(i=>this._renderProductCard(i))}
          </ul>
        `}
      </div>
    `}_renderSkeleton(){return r`
      <div class="product-list">
        ${[1,2,3,4].map(()=>r`
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
    `}_renderProductCard(e){let t=Fe(e.availability),i=e.in_cart!==!1,a=e.watch||e.watch_price||e.watch_stock,s=e.discount_pct||0,n=this._activeListId;return r`
      <li class="product-card ${i?"":"product-card--unchecked"} ${e.availability!=="available"?"product-card--unavail":""}"
          role="listitem">
        <!-- Left: Image -->
        <div class="prod-thumb-wrap">
          ${e.image_url?r`
            <img class="prod-thumb" src=${e.image_url} alt=${e.name} loading="lazy" referrerpolicy="no-referrer"
                 @error=${l=>l.target.style.display="none"} />
          `:r`<div class="prod-thumb prod-thumb--fallback">${p("cart",24)}</div>`}
          ${s>0&&e.availability==="available"?r`<span class="discount-badge">-${Math.round(s)}%</span>`:d}
        </div>

        <!-- Right: Body -->
        <div class="prod-body">
          <div class="prod-top">
            ${e.brand?r`<span class="prod-brand">${e.brand}</span>`:d}
            <div class="prod-actions">
              <button class="icon-btn ${a?"icon-btn--watch-active":""}"
                @click=${()=>this._toggleWatch(n,e.sku_id)}
                ?disabled=${!!this._busyActions[`watch:${n}:${e.sku_id}`]}
                aria-label="${a?"Dezactiveaz\u0103 monitorizare":"Monitorizeaz\u0103 pre\u021B/stoc"}"
                title="${a?"Monitorizare activ\u0103":"Monitorizeaz\u0103"}">
                ${p(a?"starFill":"star",17)}
              </button>
              <button class="icon-btn icon-btn--danger"
                @click=${()=>this._removeItem(n,e.sku_id,e.name)}
                ?disabled=${!!this._busyActions[`remove:${n}:${e.sku_id}`]}
                aria-label="Elimină ${e.name}">
                ${p("trash",17)}
              </button>
            </div>
          </div>

          <p class="prod-name">
            ${e.url?r`<a href=${e.url} target="_blank" rel="noopener">${e.name}</a>`:e.name}
          </p>

          <!-- Availability -->
          <div class="prod-avail">
            <span class="avail-dot" style="background:${t.color}"></span>
            <span class="avail-label" style="color:${t.color}">${t.label}</span>
          </div>

          <!-- Footer: price + controls -->
          <div class="prod-footer">
            <div class="price-block">
              <span class="price-current">${A(e.current_price||e.price_when_added)}</span>
              ${e.list_price>0&&e.list_price!==e.current_price?r`
                <span class="price-original">${A(e.list_price)}</span>
              `:d}
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
              <button class="cart-toggle-btn ${i?"cart-toggle-btn--active":""}"
                @click=${()=>this._toggleCart(n,e.sku_id)}
                ?disabled=${!!this._busyActions[`cart:${n}:${e.sku_id}`]}
                aria-label="${i?"Scoate din co\u0219":"Adaug\u0103 \xEEn co\u0219"}"
                aria-pressed=${i}>
                ${i?"\xCEn co\u0219":"Adaug\u0103"}
              </button>
            </div>
          </div>
        </div>
      </li>
    `}_renderMapView(){let e=this._addresses?.find(l=>l.is_active),t=e?.latitude||this.hass?.config?.latitude||44.4195,i=e?.longitude||this.hass?.config?.longitude||26.1776,a=this._pickupPoints||[],s=this._pickupPointsLoading,n=this._buildMapHtml(t,i,a);return r`
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
            ${s?"Se caut\u0103 magazine...":`Magazine aproape (${a.length})`}
          </h3>
          <button class="icon-btn" @click=${()=>this._loadPickupPoints()}
            title="Reîncarcă magazine" aria-label="Reîncarcă magazine">
            ${p("refresh",16)}
          </button>
        </div>

        ${s?r`
          <div class="pickup-skeleton">
            ${[1,2,3].map(()=>r`<div class="skeleton pickup-skel-row"></div>`)}
          </div>
        `:a.length>0?r`
          <ul class="pickup-list" role="list">
            ${a.map((l,h)=>r`
              <li class="pickup-item ${h===0?"pickup-item--best":""}" role="listitem">
                <div class="pickup-icon">${p("pin",20)}</div>
                <div class="pickup-info">
                  <span class="pickup-name">${l.name}</span>
                  <span class="pickup-addr">${l.address?`${l.address}, `:""}${l.city||""}</span>
                </div>
                <div class="pickup-right">
                  ${l.distance_km?r`<span class="pickup-dist">${l.distance_km.toFixed(1)} km</span>`:d}
                  <button class="icon-btn" @click=${()=>this._flyToStore(l)} title="Centrare pe hartă" aria-label="Centrează ${l.name}">
                    ${p("map",16)}
                  </button>
                  <button class="icon-btn" @click=${()=>this._selectPickupStore(l)} title="Selectează magazin" aria-label="Selectează ${l.name}">
                    ${p("check",16)}
                  </button>
                </div>
              </li>
            `)}
          </ul>
        `:r`
          <div class="empty-state">
            ${p("map",48)}
            <p>Nu s-au găsit magazine Auchan în zonă.</p>
            <button class="primary-btn" @click=${()=>this._loadPickupPoints()}>
              ${p("refresh",16)} Reîncarcă
            </button>
          </div>
        `}
      </div>
    `}_buildMapHtml(e,t,i){let a=g=>JSON.stringify(g).replaceAll("<","\\u003c").replaceAll("\u2028","\\u2028").replaceAll("\u2029","\\u2029"),s=a(i.map(g=>({lat:Number(g.latitude),lng:Number(g.longitude),name:String(g.name||"Magazin Auchan").slice(0,120),desc:[g.address,g.city].filter(Boolean).join(", ").slice(0,220)}))),n=a(this._mapChannel),l=window.location.origin,h=`${l}/auchan_grocery_static/vendor/leaflet.css`,c=`${l}/auchan_grocery_static/vendor/leaflet.js`,u=a(`${l}/auchan_grocery_static/images/auchan-marker.svg`);return`<!DOCTYPE html><html><head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' ${l}; style-src 'unsafe-inline' ${l}; img-src data: ${l} https://tile.openstreetmap.org; connect-src 'none'">
<link rel="stylesheet" href="${h}"/>
<script src="${c}"><\/script>
<style>
body{margin:0;font-family:system-ui,sans-serif}#map{width:100vw;height:100vh}
.auchan-pin{width:34px;height:34px;display:grid;place-items:center;background:#fff;border:2px solid #e30613;border-radius:50% 50% 50% 5px;box-shadow:0 4px 12px rgba(42,31,34,.32);transform:rotate(-45deg)}
.auchan-pin img{width:23px;height:23px;display:block;transform:rotate(45deg)}
.auchan-pin--explore{border-color:#f28c00;box-shadow:0 4px 12px rgba(242,140,0,.36)}
.store-popup{min-width:180px}.store-popup b{display:block;margin-bottom:4px}.store-popup .addr{font-size:12px;color:#5b6470;margin-bottom:8px}.store-popup button{border-radius:6px;padding:7px 10px;cursor:pointer;font-size:12px;font-weight:700;width:100%;margin-top:4px}
</style></head>
<body><div id="map"></div><script>
const CHANNEL=${n};
const AUCHAN_MARKER=${u};
const map=L.map('map').setView([${e},${t}],12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'\xA9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  maxZoom:19
}).addTo(map);
const uIcon=L.divIcon({html:'<div style="background:#E61E2A;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,.4)"></div>',className:''});
const markerHtml=variant=>'<div class="auchan-pin '+(variant==='explore'?'auchan-pin--explore':'')+'"><img src="'+AUCHAN_MARKER+'" alt="" /></div>';
const sIcon=L.divIcon({html:markerHtml('store'),className:'',iconSize:[38,44],iconAnchor:[19,42],popupAnchor:[0,-38]});
const exploreIcon=L.divIcon({html:markerHtml('explore'),className:'',iconSize:[38,44],iconAnchor:[19,42],popupAnchor:[0,-38]});
L.marker([${e},${t}],{icon:uIcon}).addTo(map).bindPopup('Loca\u021Bia ta');
function send(type,p){window.parent.postMessage({type,lat:p.lat,lng:p.lng,name:p.name,channel:CHANNEL},'*');}
function popupFor(p,color){
  const root=document.createElement('div');root.className='store-popup';
  const title=document.createElement('b');title.textContent=p.name;root.append(title);
  const addr=document.createElement('div');addr.className='addr';addr.textContent=p.desc;root.append(addr);
  const active=document.createElement('button');active.textContent='\u2713 Seteaz\u0103 ca adres\u0103 activ\u0103';active.style.cssText='background:'+color+';color:white;border:none';active.addEventListener('click',()=>send('store_set_active',p));root.append(active);
  const save=document.createElement('button');save.textContent='+ Salveaz\u0103 ca adres\u0103 nou\u0103';save.style.cssText='background:white;color:'+color+';border:1px solid '+color;save.addEventListener('click',()=>send('store_save_new',p));root.append(save);
  return root;
}
${s}.forEach(p=>{if(Number.isFinite(p.lat)&&Number.isFinite(p.lng)){L.marker([p.lat,p.lng],{icon:sIcon}).addTo(map).bindPopup(popupFor(p,'#E30613'))}});
let exploreMarkers=[];
function clearExplore(){exploreMarkers.forEach(m=>map.removeLayer(m));exploreMarkers=[];}
function addExploreStores(stores){stores.forEach(p=>{if(Number.isFinite(p.lat)&&Number.isFinite(p.lng)){const m=L.marker([p.lat,p.lng],{icon:exploreIcon}).addTo(map).bindPopup(popupFor(p,'#F28C00'));exploreMarkers.push(m)}});}
map.on('click',function(e){window.parent.postMessage({type:'map_click',lat:e.latlng.lat,lng:e.latlng.lng,channel:CHANNEL},'*');});
window.addEventListener('message',e=>{
  if(e.data?.channel!==CHANNEL)return;
  if(e.data?.type==='fly')map.flyTo([e.data.lat,e.data.lng],15);
  if(e.data?.type==='explore_stores'){clearExplore();addExploreStores(e.data.stores||[]);}
});
<\/script></body></html>`}async _startChefLogin(){try{this._chefLogin={status:"starting"};let e=await this._api.startChefLogin();this._chefLogin={...e,status:"pending"},e.login_id&&this._pollChefLogin(e.login_id,0)}catch(e){console.error("[AuchanPanel] Chef login failed",e),this._chefLogin=null,this._showToast("Autentificarea ChatGPT nu a putut fi pornit\u0103.","error")}}_pollChefLogin(e,t){!this._chefLogin||t>180||this._schedule(async()=>{try{let i=await this._api.getChefLoginStatus(e);if(this._chefLogin={...this._chefLogin,...i},i.status==="completed"){this._showToast("Contul ChatGPT a fost conectat.","success"),this._chefLogin=null,this._chefStatus=null,await this._loadChef();return}if(i.status==="failed"){this._showToast(i.error||"Autentificarea ChatGPT a e\u0219uat.","error");return}this._pollChefLogin(e,t+1)}catch(i){console.error("[AuchanPanel] Chef login polling failed",i),this._pollChefLogin(e,t+1)}},2e3)}async _logoutChef(){try{await this._api.logoutChef(),this._chefStatus=null,this._chefPlan=null,this._chefThreadId="",await this._loadChef(),this._showToast("Contul ChatGPT a fost deconectat.","success")}catch(e){console.error("[AuchanPanel] Chef logout failed",e),this._showToast("Contul nu a putut fi deconectat.","error")}}_setChefPreference(e,t){this._chefPreferences={...this._chefPreferences,[e]:t}}async _saveChefPreferences(){try{this._chefPreferences=await this._api.saveChefPreferences(this._chefPreferences),this._chefSettingsOpen=!1,this._showToast("Preferin\u021Bele au fost salvate.","success")}catch(e){console.error("[AuchanPanel] Chef preferences failed",e),this._showToast("Preferin\u021Bele nu au putut fi salvate.","error")}}async _askChef(e=this._chefPrompt){let t=String(e||"").trim();if(!(t.length<3||this._chefGenerating)){this._chefPrompt=t,this._chefGenerating=!0;try{let i=await this._api.createChefPlan(t,this._chefThreadId);this._chefPlan=i.recipe,this._chefThreadId=i.thread_id||this._chefThreadId;let a={};(i.recipe?.ingredients||[]).forEach((s,n)=>{let l=(s.matches||[]).find(h=>h.is_available)||s.matches?.[0];l?.sku_id&&(a[n]=l.sku_id)}),this._chefSelected=a}catch(i){console.error("[AuchanPanel] Chef generation failed",i),this._showToast("Chef AI nu a putut genera re\u021Beta. \xCEncearc\u0103 din nou.","error")}this._chefGenerating=!1}}_selectChefProduct(e,t){this._chefSelected={...this._chefSelected,[e]:t}}_skipChefProduct(e){let t={...this._chefSelected};delete t[e],this._chefSelected=t}async _importChefPlan(){if(!this._chefPlan||this._chefImporting)return;let e=(this._chefPlan.ingredients||[]).flatMap((t,i)=>{let a=this._chefSelected[i],s=(t.matches||[]).find(n=>n.sku_id===a);return s?[{ingredient_name:t.name,search_query:s.match_query||t.search_query,sku_id:s.sku_id,quantity:s.suggested_packages||1}]:[]});if(!e.length){this._showToast("Alege cel pu\u021Bin un produs.","error");return}this._chefImporting=!0;try{let t=await this._api.importChefProducts({list_id:this._chefTargetListId||this._activeListId||"new",recipe_title:this._chefPlan.title,selections:e});await this._loadLists(),t.list_id&&(this._activeListId=t.list_id);let i=t.rejected_count?`, ${t.rejected_count} respinse la reverificare`:"";this._showToast(`${t.added_count} produse ad\u0103ugate${i}.`,t.added_count?"success":"error"),t.added_count&&(this._tab="list")}catch(t){console.error("[AuchanPanel] Chef import failed",t),this._showToast("Produsele nu au putut fi importate.","error")}this._chefImporting=!1}_renderChefPreferences(){let e=this._chefPreferences;return r`
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
              @input=${t=>this._setChefPreference("dietary",t.target.value.split(",").map(i=>i.trim()).filter(Boolean))} />
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
      </section>`}_renderChefProduct(e,t,i){let a=e.sku_id===i;return r`
      <button class="chef-product ${a?"chef-product--selected":""}"
        @click=${()=>this._selectChefProduct(t,e.sku_id)}>
        <span class="chef-product-check">${a?"\u2713":""}</span>
        ${e.image_url?r`<img src=${e.image_url} alt=${e.name} loading="lazy" />`:r`<span class="chef-product-placeholder">${p("cart",24)}</span>`}
        <span class="chef-product-copy">
          <strong>${e.name}</strong>
          <small>${e.brand||"Auchan"} · SKU ${e.sku_id}</small>
          <span><b>${A(e.price)}</b>${e.suggested_packages>1?r` · ${e.suggested_packages} bucăți`:d}</span>
        </span>
      </button>`}_renderChefPlan(){let e=this._chefPlan;if(!e)return d;if(e.type==="clarification")return r`
      <section class="chef-clarification">
        <span class="chef-avatar">?</span>
        <div><strong>Mai am nevoie de un detaliu</strong><p>${e.message}</p></div>
      </section>`;let t=Object.keys(this._chefSelected).length,i=(e.ingredients||[]).reduce((a,s,n)=>{let l=(s.matches||[]).find(h=>h.sku_id===this._chefSelected[n]);return a+(l?.price||0)*(l?.suggested_packages||1)},0);return r`
      <article class="chef-plan">
        <header class="chef-plan-head">
          <div><span class="chef-kicker">Propunerea Chef AI</span><h2>${e.title}</h2><p>${e.description}</p></div>
          <div class="chef-meta"><span>${e.servings} porții</span><span>${e.prep_minutes+e.cook_minutes} min</span><span>${e.difficulty}</span></div>
        </header>
        <section class="chef-plan-section">
          <h3>Ingrediente și produse Auchan</h3>
          <p class="chef-help">Alegerea este a ta. Importăm numai SKU-ul bifat și îl reverificăm înainte de salvare.</p>
          <div class="chef-ingredients">
            ${(e.ingredients||[]).map((a,s)=>r`
              <div class="chef-ingredient">
                <div class="chef-ingredient-title">
                  <span>${s+1}</span>
                  <div>
                    <strong>${a.name}</strong>
                    <small>${a.quantity||""} ${a.unit||""}${a.optional?" \xB7 op\u021Bional":""}</small>
                    ${this._chefSelected[s]?r`<button @click=${()=>this._skipChefProduct(s)}>Am deja / nu cumpăr</button>`:d}
                  </div>
                </div>
                ${(a.matches||[]).length?r`
                  <div class="chef-products">${a.matches.map(n=>this._renderChefProduct(n,s,this._chefSelected[s]))}</div>
                `:r`<div class="chef-no-match">Nu am găsit un produs alimentar suficient de relevant. Ingredientul nu va fi importat.</div>`}
              </div>`)}
          </div>
        </section>
        <section class="chef-plan-section chef-steps">
          <h3>Mod de preparare</h3>
          <ol>${(e.instructions||[]).map(a=>r`<li>${a}</li>`)}</ol>
        </section>
        <footer class="chef-import-bar">
          <div><strong>${t} produse</strong><span>Estimare: ${A(i)}</span></div>
          <select .value=${this._chefTargetListId||this._activeListId||"new"} @change=${a=>this._chefTargetListId=a.target.value}>
            ${(this._lists||[]).map(a=>r`<option value=${a.id}>${a.name}</option>`)}
            <option value="new">+ Listă nouă pentru rețetă</option>
          </select>
          <button class="primary-btn" ?disabled=${this._chefImporting||!t} @click=${this._importChefPlan}>
            ${this._chefImporting?"Se reverific\u0103...":`Adaug\u0103 ${t} produse`}
          </button>
        </footer>
      </article>`}_renderRecipesView(){if(this._chefStatusLoading&&!this._chefStatus)return r`<div class="chef-loading"><div class="spinner"></div><span>Se pregătește Chef AI...</span></div>`;if(!this._chefStatus?.configured)return r`
      <section class="chef-onboarding">
        <span class="chef-avatar">AI</span>
        <h2>Configurează Chef AI</h2>
        <p>Adaugă adresa serviciului privat și tokenul în <strong>Setări → Dispozitive și servicii → Auchan Grocery → Configurează</strong>.</p>
        <button class="secondary-btn" @click=${()=>{this._chefStatus=null,this._loadChef()}}>${p("refresh",16)} Verifică din nou</button>
      </section>`;if(!this._chefStatus?.connected)return r`
      <section class="chef-onboarding">
        <span class="chef-avatar">AI</span>
        <span class="chef-kicker">Fără cheie API</span>
        <h2>Conectează contul ChatGPT</h2>
        <p>Primești un cod, deschizi pagina oficială OpenAI și autorizezi dispozitivul. Datele de autentificare rămân în serviciul tău privat.</p>
        ${this._chefStatus?.error?r`<div class="chef-error">${this._chefStatus.error}</div>`:d}
        ${this._chefLogin?.user_code?r`
          <div class="chef-device-code">
            <small>Cod de autorizare</small>
            <strong>${this._chefLogin.user_code}</strong>
            <div>
              <button class="secondary-btn" @click=${()=>navigator.clipboard?.writeText(this._chefLogin.user_code)}>Copiază codul</button>
              <a class="primary-btn" href=${this._chefLogin.verification_url||"https://auth.openai.com/codex/device"} target="_blank" rel="noopener">Deschide OpenAI</a>
            </div>
            <span class="chef-waiting"><i></i>Aștept autorizarea...</span>
          </div>
        `:r`<button class="primary-btn" ?disabled=${this._chefLogin?.status==="starting"} @click=${this._startChefLogin}>${this._chefLogin?.status==="starting"?"Se genereaz\u0103 codul...":"Conecteaz\u0103 ChatGPT"}</button>`}
      </section>`;let e=this._chefStatus.account||{},t=["Cin\u0103 rapid\u0103 \xEEn 30 de minute","Ceva bun din pui pentru familie","O re\u021Bet\u0103 vegetarian\u0103 economic\u0103"];return r`
      <div class="chef-view">
        <header class="chef-header">
          <div><span class="chef-kicker">Auchan Chef AI</span><h1>Ce gătim azi?</h1><p>Rețetă personalizată, apoi produse reale din magazinul tău.</p></div>
          <div class="chef-account">
            <span><i></i>${e.email||"ChatGPT conectat"}${e.plan_type?` \xB7 ${e.plan_type}`:""}</span>
            <button class="icon-btn" title="Preferințe" @click=${()=>this._chefSettingsOpen=!this._chefSettingsOpen}>${p("wrench",18)}</button>
            <button class="text-btn" @click=${this._logoutChef}>Ieșire</button>
          </div>
        </header>
        ${this._chefSettingsOpen?this._renderChefPreferences():d}
        <section class="chef-composer">
          <textarea .value=${this._chefPrompt} @input=${i=>this._chefPrompt=i.target.value}
            @keydown=${i=>{(i.metaKey||i.ctrlKey)&&i.key==="Enter"&&this._askChef()}}
            placeholder="Ex: Am niște dovlecei și vreau o cină ușoară pentru 3 persoane, fără lactoză..."></textarea>
          <button class="chef-send" ?disabled=${this._chefGenerating||this._chefPrompt.trim().length<3} @click=${()=>this._askChef()} aria-label="Trimite către Chef AI">${this._chefGenerating?r`<div class="spinner spinner--sm"></div>`:p("arrowUp",20)}</button>
          <div class="chef-chips">${t.map(i=>r`<button @click=${()=>{this._chefPrompt=i,this._askChef(i)}}>${i}</button>`)}</div>
        </section>
        ${this._chefGenerating?r`<div class="chef-thinking"><div class="spinner"></div><div><strong>Chef AI pregătește propunerea</strong><span>Apoi verificăm separat produsele și disponibilitatea Auchan.</span></div></div>`:this._renderChefPlan()}
      </div>`}_renderLegacyRecipesView(){return this._recipesLoading?r`
        <div class="recipes-skeleton">
          ${[1,2,3,4,5,6].map(()=>r`
            <div class="recipe-card recipe-skel-card">
              <div class="skel-img"></div>
              <div class="recipe-body">
                <div class="skel-line" style="width:80%"></div>
                <div class="skel-line" style="width:50%;margin-top:6px"></div>
              </div>
            </div>
          `)}
        </div>`:this._recipes?.length?r`
      <div class="recipes-header">
        <span class="recipes-count">${this._recipes.length} rețete</span>
        <button class="icon-btn" @click=${this._loadRecipes} title="Reîncarcă rețete">${p("refresh",16)}</button>
      </div>
      <div class="recipes-grid">
        ${this._recipes.map(e=>this._renderRecipeCard(e))}
      </div>
      ${this._recipeModalData?this._renderRecipeModal():d}
    `:r`
      <div class="empty-state">
        ${p("recipes",48)}
        <h3>Rețete Auchan</h3>
        <p>Nu s-au găsit rețete. Verifică conexiunea la internet.</p>
        <button class="primary-btn" @click=${this._loadRecipes}>${p("refresh",16)} Reîncarcă</button>
      </div>`}_renderRecipeCard(e){return r`
      <article class="recipe-card" role="button" tabindex="0"
        aria-label="Deschide rețeta ${e.title}"
        @click=${()=>this._openRecipeModal(e)}
        @keydown=${t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this._openRecipeModal(e))}}>
        <div class="recipe-img-wrap">
          ${e.image_url?r`
            <img class="recipe-img" src=${e.image_url} alt=${e.title} loading="lazy" referrerpolicy="no-referrer"
                 @error=${t=>t.target.parentElement.innerHTML=`<div class="recipe-img--placeholder">${p("recipes",32)}</div>`} />
          `:r`<div class="recipe-img--placeholder">${p("recipes",32)}</div>`}
          ${e.ingredients?.length>0?r`
            <div class="recipe-badge">${e.ingredients.length} ing.</div>
          `:d}
        </div>
        <div class="recipe-body">
          <h4 class="recipe-title">${e.title}</h4>
          <div class="recipe-meta">
            ${e.prep_time?r`<span>${p("clock",11)} ${e.prep_time}</span>`:d}
            ${e.servings?r`<span>👥 ${e.servings}</span>`:d}
          </div>
        </div>
      </article>`}async _openRecipeModal(e){if(this._recipeModalData={recipe:e,loading:!e.detail_fetched,selected:new Set,importing:!1,result:null},e.detail_fetched)this._recipeModalData.selected=new Set((e.ingredients||[]).map((t,i)=>t.found&&t.sku_id&&t.product_id?i:null).filter(t=>t!==null));else try{let t=await this._api.getJson(`/api/auchan_grocery/recipes/${e.id}/detail`);Object.assign(e,t),e.detail_fetched=!0,this._recipeModalData={...this._recipeModalData,recipe:e,loading:!1},this._recipeModalData.selected=new Set((e.ingredients||[]).map((i,a)=>i.found&&i.sku_id&&i.product_id?a:null).filter(i=>i!==null))}catch{this._recipeModalData={...this._recipeModalData,loading:!1},this._showToast("Nu s-au putut \xEEnc\u0103rca produsele re\u021Betei","error")}}_renderRecipeModal(){let{recipe:e,loading:t,selected:i,importing:a,result:s}=this._recipeModalData,l=(e.ingredients||[]).map((c,u)=>({item:c,index:u})).filter(({item:c})=>c.found&&c.sku_id&&c.product_id),h=this._lists||[];return r`
      <div class="modal-overlay" @click=${()=>this._recipeModalData=null}
           role="dialog" aria-modal="true" aria-label="Produsele rețetei">
        <div class="modal-card recipe-modal" @click=${c=>c.stopPropagation()}>

          <!-- Header -->
          <div class="modal-header">
            <div class="recipe-modal-title-wrap">
              <span class="modal-title">${e.title}</span>
              ${e.prep_time?r`<span class="recipe-modal-meta">⏱ ${e.prep_time}</span>`:d}
              ${e.servings?r`<span class="recipe-modal-meta">👥 ${e.servings}</span>`:d}
            </div>
            <button class="icon-btn" @click=${()=>this._recipeModalData=null} aria-label="Închide">${p("xmark",18)}</button>
          </div>

          <!-- Image (if available) -->
          ${e.image_url?r`
            <img class="recipe-modal-img" src=${e.image_url} alt=${e.title} referrerpolicy="no-referrer" />
          `:d}

          <!-- Import result -->
          ${s?r`
            <div class="recipe-import-result">
              <div class="import-result-row">
                ${p("cart",20)}
                <span>${s.added_count} produse adăugate în lista <strong>${s.list_name}</strong></span>
              </div>
              ${s.not_found?.length?r`
                <div class="import-not-found">
                  <span class="import-not-found-label">Indisponibile:</span>
                  ${s.not_found.map(c=>r`<span class="import-not-found-item">${c}</span>`)}
                </div>
              `:d}
              <button class="primary-btn" style="margin-top:12px;width:100%"
                @click=${()=>{this._recipeModalData=null,this._tab="list"}}>
                ${p("list",16)} Vezi lista
              </button>
            </div>
          `:r`

            <!-- Loading state -->
            ${t?r`
              <div class="recipe-modal-loading">
                <div class="spinner"></div>
                <span>Se încarcă produsele rețetei...</span>
              </div>
            `:r`

              <!-- Ingredients checklist -->
              <div class="ingredients-section">
                <div class="ingredients-header">
                  <span class="section-heading">Produse din sliderul Auchan</span>
                  ${l.length?r`<div class="ingredients-sel-actions">
                    <button class="text-btn" @click=${()=>{this._recipeModalData={...this._recipeModalData,selected:new Set(l.map(({index:c})=>c))}}}>Toate</button>
                    <button class="text-btn" @click=${()=>{this._recipeModalData={...this._recipeModalData,selected:new Set}}}>Niciuna</button>
                  </div>`:d}
                </div>
                <ul class="recipe-ingredients-list">
                  ${l.length===0?r`
                    <li class="recipe-no-ing recipe-no-ing--safe">
                      <strong>Niciun produs verificat</strong>
                      <span>Auchan nu publică un slider de produse pentru această rețetă. Importul automat este dezactivat pentru a evita produse fără legătură.</span>
                    </li>
                  `:l.map(({item:c,index:u})=>r`
                    <li class="recipe-ing-item ${i.has(u)?"recipe-ing-item--checked":""}"
                        @click=${()=>{let g=new Set(i);g.has(u)?g.delete(u):g.add(u),this._recipeModalData={...this._recipeModalData,selected:g}}}>
                      <span class="recipe-ing-check">${i.has(u)?"\u2713":""}</span>
                      ${c.found&&c.image_url?r`
                        <img class="recipe-ing-thumb" src=${c.image_url} alt=${c.name} referrerpolicy="no-referrer" />
                      `:d}
                      <span class="recipe-ing-content">
                        <span class="recipe-ing-name">
                          ${c.name}
                        </span>
                        ${c.sku_id||c.price?r`
                          <span class="recipe-ing-meta">
                            ${c.sku_id?r`SKU ${c.sku_id}`:d}
                            ${c.sku_id&&c.price?r`<span aria-hidden="true">·</span>`:d}
                            ${c.price?r`<strong>${Number(c.price).toFixed(2).replace(".",",")} lei</strong>`:d}
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
                  <label class="recipe-list-label">${p("list",14)} Adaugă în lista:</label>
                  <select class="header-select" .value=${this._recipeImportListId||this._activeListId||""}
                    @change=${c=>this._recipeImportListId=c.target.value}>
                    ${h.map(c=>r`<option value=${c.id} ?selected=${c.id===(this._recipeImportListId||this._activeListId)}>${c.name||c.id}</option>`)}
                    <option value="new">+ Creează listă nouă din rețetă</option>
                  </select>
                </div>
                <div class="recipe-import-btns">
                  <a href=${e.url} target="_blank" rel="noopener" class="secondary-btn" style="flex:0 0 auto;padding:10px 14px">
                    ${p("link",15)}
                  </a>
                  <button class="primary-btn" style="flex:1"
                    ?disabled=${a||l.length===0||i.size===0}
                    @click=${()=>this._importRecipe(e,i)}>
                    ${a?r`<div class="spinner spinner--sm"></div> Se importă...`:r`${p("cart",16)} Adaugă ${i.size>0?i.size:""} produse`}
                  </button>
                </div>
              </div>
            `}
          `}
        </div>
      </div>`}async _importRecipe(e,t){this._recipeModalData={...this._recipeModalData,importing:!0};let i=e.ingredients||[],a=[...t].map(l=>i[l]).filter(Boolean),s=this._recipeImportListId||this._activeListId,n=s==="new";try{let l=await this._api.postJson(`/api/auchan_grocery/recipes/${e.id}/import`,{list_id:s,list_name:n?`Re\u021Bet\u0103: ${e.title.slice(0,40)}`:void 0,sku_ids:a.map(h=>h.sku_id)});await this._loadLists(),l.list_id&&(this._activeListId=l.list_id),this._recipeModalData={...this._recipeModalData,importing:!1,result:l},this._showToast(`${l.added_count} produse ad\u0103ugate!`,"success")}catch{this._recipeModalData={...this._recipeModalData,importing:!1},this._showToast("Eroare la importul re\u021Betei","error")}}_renderActionBar(){if(!this._activeList||this._tab==="recipes")return d;let e=(this._activeList?.items||[]).filter(t=>t.in_cart!==!1).length;return r`
      <div class="action-bar" role="toolbar" aria-label="Acțiuni">
        <button class="action-btn action-btn--primary" @click=${this._generateCartLink}
          aria-label="Generează link coș">
          ${p("qr",18)} Coș (${e})
        </button>
        <button class="action-btn" @click=${()=>{this._tab="map"}}
          aria-label="Deschide harta">
          ${p("map",18)} Hartă
        </button>
      </div>
    `}_renderQrModal(){return r`
      <div class="modal-overlay" @click=${()=>{this._showQr=!1}} role="dialog" aria-modal="true" aria-label="Link coș">
        <div class="modal-card" @click=${e=>e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">Scanează sau copiază link-ul</span>
            <button class="icon-btn" @click=${()=>{this._showQr=!1}} aria-label="Închide">${p("xmark",18)}</button>
          </div>
          <div id="qr-container" class="qr-container"></div>
          <div class="url-row">
            <input class="url-input" readonly .value=${this._qrUrl||""} aria-label="Link coș" />
            <button class="icon-btn" @click=${()=>navigator.clipboard?.writeText(this._qrUrl)} title="Copiază" aria-label="Copiază link">
              ${p("clipboard",18)}
            </button>
          </div>
          <a href=${this._qrUrl} target="_blank" rel="noopener" class="primary-btn">
            ${p("cart",16)} Deschide pe Auchan.ro
          </a>
        </div>
      </div>
    `}_renderAddressModal(){return r`
      <div class="modal-overlay" @click=${this._closeAddressModal} role="dialog" aria-modal="true" aria-label="Adaugă adresă">
        <div class="modal-card modal-card--addr" @click=${e=>e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">${p("pin",18)} Adresă nouă</span>
            <button class="icon-btn" @click=${this._closeAddressModal} aria-label="Închide">${p("xmark",18)}</button>
          </div>

          <div class="addr-field">
            <label class="field-label">Etichetă</label>
            <div class="chip-row">
              ${["Acas\u0103","Birou","Familie","Altul"].map(e=>r`
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
              ${this._addrLoading?r`<div class="spinner"></div>`:d}
            </div>
            ${this._addrSuggestions.length>0?r`
              <ul class="suggestions" role="listbox">
                ${this._addrSuggestions.map(e=>r`
                  <li class="suggestion-row" role="option" @click=${()=>this._selectAddrSuggestion(e)}>
                    ${p("pin",14)}
                    <span>${e.display_name}</span>
                  </li>
                `)}
              </ul>
            `:d}
            ${this._addrSelected?r`
              <div class="addr-selected">
                ${p("check",14)}
                <span>${this._addrSelected.display_name}</span>
              </div>
            `:d}
          </div>

          <div class="addr-actions">
            <button class="secondary-btn" @click=${this._closeAddressModal}>Anulează</button>
            <button class="primary-btn" @click=${this._saveAddress}
              ?disabled=${!this._addrSelected||this._addrLoading}>
              ${this._addrLoading?r`<div class="spinner spinner--sm"></div>`:p("check",16)}
              Salvează
            </button>
          </div>
        </div>
      </div>
    `}_renderAddressSheet(){let e=this._addresses||[];return r`
      <div class="sheet-backdrop" @click=${()=>this._showAddressSheet=!1} role="dialog" aria-modal="true" aria-label="Selectează adresa">
        <div class="sheet-card" @click=${t=>t.stopPropagation()}>
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            ${p("pin",18)}
            <span class="sheet-title">Adresă activă</span>
            <button class="icon-btn" @click=${()=>this._showAddressSheet=!1} aria-label="Închide">
              ${p("xmark",18)}
            </button>
          </div>

          <div class="sheet-body">
            ${e.length===0?r`
              <p class="sheet-empty">Nicio adresă salvată. Adaugă una!</p>
            `:e.map(t=>r`
              <div class="sheet-addr-row ${t.is_active?"sheet-addr-row--active":""}"
                @click=${()=>{this._activateAddress(t.id),this._showAddressSheet=!1}}>
                <span class="sheet-addr-icon">${p("pin",16)}</span>
                <div class="sheet-addr-info">
                  <div class="sheet-addr-label">${t.label}</div>
                  ${t.display_name?r`<div class="sheet-addr-sub">${t.display_name}</div>`:d}
                </div>
                ${t.is_active?r`
                  <span class="sheet-addr-check">${p("check",16)}</span>
                `:d}
              </div>
            `)}
          </div>

          <div class="sheet-footer">
            <button class="sheet-add-btn" @click=${this._openAddAddressModal}>
              ${p("plus",16)} Adresă nouă
            </button>
          </div>
        </div>
      </div>
    `}};F(j,"properties",{hass:{type:Object},narrow:{type:Boolean},panel:{type:Object},_lists:{type:Array,state:!0},_activeListId:{type:String,state:!0},_searchQuery:{type:String,state:!0},_searchResults:{type:Array,state:!0},_pickupPoints:{type:Array,state:!0},_addresses:{type:Array,state:!0},_loading:{type:Boolean,state:!0},_searchLoading:{type:Boolean,state:!0},_showQr:{type:Boolean,state:!0},_qrUrl:{type:String,state:!0},_tab:{type:String,state:!0},_notification:{type:Object,state:!0},_recipes:{type:Array,state:!0},_recipesLoading:{type:Boolean,state:!0},_showAddressModal:{type:Boolean,state:!0},_showAddressSheet:{type:Boolean,state:!0},_addrQuery:{type:String,state:!0},_addrSuggestions:{type:Array,state:!0},_addrLabel:{type:String,state:!0},_addrSelected:{type:Object,state:!0},_addrLoading:{type:Boolean,state:!0},_regionInfo:{type:Object,state:!0},_showDiagnostics:{type:Boolean,state:!0},_dialog:{type:Object,state:!0},_dialogValue:{type:String,state:!0},_sortBy:{type:String,state:!0},_filterCategory:{type:String,state:!0},_isMobile:{type:Boolean,state:!0},_pickupPointsLoading:{type:Boolean,state:!0},_busyActions:{type:Object,state:!0},_recipeModalData:{type:Object,state:!0},_recipeImportListId:{type:String,state:!0},_chefStatus:{type:Object,state:!0},_chefStatusLoading:{type:Boolean,state:!0},_chefLogin:{type:Object,state:!0},_chefPrompt:{type:String,state:!0},_chefPlan:{type:Object,state:!0},_chefThreadId:{type:String,state:!0},_chefSelected:{type:Object,state:!0},_chefPreferences:{type:Object,state:!0},_chefSettingsOpen:{type:Boolean,state:!0},_chefGenerating:{type:Boolean,state:!0},_chefImporting:{type:Boolean,state:!0},_chefTargetListId:{type:String,state:!0}}),F(j,"styles",Q`
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
    @font-face {
      font-family: "Barlow Condensed";
      src: url("/auchan_grocery_static/fonts/barlow-condensed-700.woff2") format("woff2");
      font-style: normal;
      font-weight: 700;
      font-display: swap;
    }

    /* ── Design Tokens ── */
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
      font-family: "Source Sans 3", "Segoe UI", system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;

      /* Auchan Red */
      --accent:       #E30613;
      --accent-light: rgba(227, 6, 19, 0.09);
      --accent-hover: #B9000B;

      /* ── Light mode (HA default) ── */
      --bg:        #F7F6F2;
      --surface:   #FFFFFF;
      --surface-2: rgba(118, 118, 128, 0.12);
      --surface-3: rgba(118, 118, 128, 0.20);
      --text:      #17212B;
      --text-2:    #4B5560;
      --text-3:    #737B84;
      --sep:       rgba(23,33,43,0.14);
      --sep-strong:rgba(23,33,43,0.22);

      /* Override with HA CSS vars when available */
      --bg:      var(--primary-background-color, #F7F6F2);
      --surface: var(--card-background-color, #FFFFFF);
      --text:    var(--primary-text-color, #17212B);
      --text-2:  var(--secondary-text-color, #4B5560);
      --sep:     var(--divider-color, rgba(60,60,67,0.18));

      /* Semantic colors */
      --green:  #008F4C;
      --orange: #F28C00;
      --red:    #D8212A;
      --blue:   #1769AA;

      /* Radius */
      --r-xs: 6px;
      --r-sm: 10px;
      --r-md: 12px;
      --r-lg: 16px;
      --r-xl: 22px;

      /* Shadows — visible in light mode */
      --sh-sm: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05);
      --sh-md: 0 4px 12px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06);
      --sh-lg: 0 12px 32px rgba(0,0,0,.14), 0 4px 8px rgba(0,0,0,.07);

      /* Card border — explicit for light mode */
      --card-border: 1px solid rgba(0,0,0,0.07);
    }

    /* ── Dark mode overrides ── */
    @media (prefers-color-scheme: dark) {
      :host {
        --bg:        #000000;
        --surface:   #1C1C1E;
        --surface-2: rgba(255,255,255,0.07);
        --surface-3: rgba(255,255,255,0.12);
        --text:      #FFFFFF;
        --text-2:    rgba(235,235,245,0.75);
        --text-3:    rgba(235,235,245,0.35);
        --sep:       rgba(84,84,88,0.60);
        --sep-strong:rgba(84,84,88,0.80);
        --sh-sm: 0 1px 3px rgba(0,0,0,.30);
        --sh-md: 0 4px 12px rgba(0,0,0,.40);
        --sh-lg: 0 12px 32px rgba(0,0,0,.55);
        --card-border: 1px solid rgba(255,255,255,0.08);
        --accent-light: rgba(227, 9, 20, 0.18);
      }
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
      gap: 6px;
      padding: 0 10px;
      background: var(--surface);
      border-bottom: 1px solid var(--sep-strong, var(--sep));
      flex-shrink: 0;
      height: 58px;
      box-shadow: var(--sh-sm);
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
      gap: 6px;
      flex-shrink: 0;
      margin-right: 4px;
      position: relative;
      padding-right: 10px;
    }
    .header-brand::after {
      content: "";
      width: 3px;
      height: 26px;
      background: var(--accent);
      transform: skew(-12deg);
      border-radius: 2px;
    }

    .brand-icon {
      width: 28px;
      height: 28px;
      background: var(--accent);
      color: white;
      border-radius: 7px 7px 2px 7px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-name {
      font-family: "Barlow Condensed", sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: .1px;
      line-height: .86;
      text-transform: uppercase;
    }
    .brand-name small {
      display: block;
      color: var(--text-2);
      font: 700 8px/1 "Source Sans 3", sans-serif;
      letter-spacing: 1.2px;
      margin-top: 3px;
    }

    /* Address pill — clickable */
    .header-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 9px;
      background: var(--surface-2);
      border: 1px solid var(--sep);
      border-radius: 100px;
      color: var(--text-2);
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      flex-shrink: 1;
      min-width: 0;
      max-width: 130px;
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
      gap: 4px;
      color: var(--text-3);
      flex: 1;
      min-width: 0;
      max-width: 160px;
    }

    .header-select {
      flex: 1;
      min-width: 0;
      background: transparent;
      border: none;
      color: var(--text);
      padding: 5px 2px;
      font-size: 13px;
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
      gap: 2px;
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
      font-size: 11px;
      color: var(--orange);
      font-weight: 600;
      padding: 3px 7px;
      background: rgba(255,159,10,.12);
      border-radius: 100px;
    }

    /* ── Diagnostics ── */
    .diagnostics {
      background: var(--surface);
      border-bottom: 1px solid var(--sep);
      padding: 10px 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      font-size: 12px;
      animation: slideDown 150ms ease-out;
      flex-shrink: 0;
    }

    .diag-row { display: flex; align-items: center; gap: 6px; }
    .diag-label { color: var(--text-2); }
    .diag-val { font-family: "SF Mono", "Fira Code", monospace; color: var(--accent); background: var(--accent-light); padding: 1px 5px; border-radius: 4px; max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
    .diag-val--missing { color: var(--red); background: rgba(255,59,48,.1); }
    .diag-refresh-btn { margin-left: auto; font-size: 12px; font-weight: 600; color: var(--blue); background: none; border: none; cursor: pointer; padding: 4px 8px; border-radius: var(--r-xs); }
    .diag-refresh-btn:hover { background: rgba(0,122,255,.1); }

    /* ── Search ── */
    .search-wrap {
      position: relative;
      z-index: 100;
      flex-shrink: 0;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: var(--surface);
      border-bottom: 1px solid var(--sep);
    }

    .search-icon { color: var(--text-3); flex-shrink: 0; }

    .search-input {
      flex: 1;
      background: var(--surface-2);
      border: 1.5px solid transparent;
      border-radius: var(--r-sm);
      color: var(--text);
      padding: 9px 14px;
      font-size: 15px;
      outline: none;
      transition: border-color 150ms, background 150ms;
    }
    .search-input:focus {
      background: var(--surface);
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-light);
    }

    .search-clear {
      background: none;
      border: none;
      color: var(--text-3);
      cursor: pointer;
      padding: 4px;
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
      gap: 12px;
      padding: 10px 16px;
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

    .search-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .search-name { font-size: 12px; font-weight: 500; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3; }
    .search-brand { font-size: 11px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; }

    .search-price-col { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
    .search-price { font-size: 14px; font-weight: 700; color: var(--text); }
    .search-discount { font-size: 11px; font-weight: 700; color: var(--green); background: rgba(52,199,89,.12); padding: 1px 6px; border-radius: 99px; }

    .search-add-btn {
      width: 32px; height: 32px;
      background: var(--accent); color: white;
      border: none; border-radius: var(--r-xs);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 120ms, transform 120ms;
    }
    .search-add-btn:hover { background: var(--accent-hover); transform: scale(1.05); }

    .search-skeleton {
      height: 64px;
      margin: 8px 16px;
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
      gap: 3px;
      padding: 8px 4px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-3);
      cursor: pointer;
      font-size: 10px;
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

    .tab-label { font-size: 10px; }

    /* ── Tab content ── */
    .tab-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    /* Desktop sidebar */
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: var(--surface);
      border-right: 1px solid var(--sep);
      overflow-y: auto;
      padding: 12px;
    }

    .sidebar-nav { display: flex; flex-direction: column; gap: 16px; }
    .sidebar-section { display: flex; flex-direction: column; gap: 4px; }
    .sidebar-heading { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-3); padding: 0 4px 6px; margin: 0; border-bottom: 1px solid var(--sep); }
    .sidebar-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border: none; background: none; border-radius: var(--r-sm); color: var(--text-2); cursor: pointer; font-size: 14px; font-weight: 500; width: 100%; transition: background 120ms; text-align: left; }
    .sidebar-item:hover { background: var(--surface-2); }
    .sidebar-item--active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
    .sidebar-count { margin-left: auto; font-size: 12px; background: var(--surface-2); padding: 2px 8px; border-radius: 99px; color: var(--text-2); }
    .sidebar-add-btn { display: flex; align-items: center; gap: 6px; padding: 7px 10px; border: 1px dashed var(--sep); background: none; border-radius: var(--r-sm); color: var(--text-3); cursor: pointer; font-size: 13px; width: 100%; transition: all 120ms; }
    .sidebar-add-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
    .sidebar-addr { display: flex; align-items: center; gap: 4px; }
    .sidebar-addr-main { display: flex; align-items: center; gap: 6px; flex: 1; padding: 7px 10px; border: none; background: none; border-radius: var(--r-sm); cursor: pointer; font-size: 13px; font-weight: 500; color: var(--text-2); transition: background 120ms; }
    .sidebar-addr-main:hover { background: var(--surface-2); }
    .sidebar-addr--active .sidebar-addr-main { color: var(--accent); }
    .sidebar-addr-del { width: 28px; height: 28px; border: none; background: none; color: var(--text-3); cursor: pointer; border-radius: var(--r-xs); display: flex; align-items: center; justify-content: center; transition: background 120ms, color 120ms; }
    .sidebar-addr-del:hover { background: rgba(255,59,48,.1); color: var(--red); }
    .dot-active { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-left: auto; }

    /* Desktop main content */
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    /* ── Dashboard ── */
    .dash {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-bottom: 80px;
    }

    .dash-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px;
      background: var(--surface);
      border-radius: var(--r-lg);
      border: 1px solid var(--sep);
      box-shadow: var(--sh-sm);
      position: relative;
      overflow: hidden;
    }
    .dash-hero::after {
      content: '';
      position: absolute;
      inset: 0;
      width: 7px;
      left: auto;
      background: var(--accent);
      pointer-events: none;
    }

    .dash-list-name { margin: 0 0 8px; font: 700 27px/1 "Barlow Condensed", sans-serif; letter-spacing: .1px; color: var(--text); text-transform: uppercase; }
    .dash-total-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-3); font-weight: 600; }
    .dash-total-val { font: 700 32px/1 "Barlow Condensed", sans-serif; color: var(--text); letter-spacing: 0; }
    .dash-hero-right { text-align: right; display: flex; flex-direction: column; gap: 4px; z-index: 1; }

    .dash-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 99px;
    }
    .dash-chip--green { background: rgba(52,199,89,.15); color: var(--green); }

    .bento {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .bento-card {
      background: var(--surface);
      border-radius: var(--r-md);
      border: var(--card-border, 1px solid var(--sep));
      box-shadow: var(--sh-sm);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: transform 200ms, box-shadow 200ms;
    }
    .bento-card:hover { transform: translateY(-2px); box-shadow: var(--sh-md); }

    .stat-card {
      flex-direction: row;
      align-items: center;
      cursor: pointer;
      border: none;
      text-align: left;
      color: var(--text);
    }
    .stat-card--alert { border-color: rgba(255,59,48,.25); background: rgba(255,59,48,.04); }

    .stat-icon {
      width: 44px; height: 44px;
      border-radius: var(--r-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon--blue { background: rgba(0,122,255,.12); color: var(--blue); }
    .stat-icon--orange { background: rgba(255,159,10,.12); color: var(--orange); }
    .stat-icon--red { background: rgba(255,59,48,.12); color: var(--red); }
    .stat-icon--green { background: rgba(52,199,89,.12); color: var(--green); }

    .stat-body { display: flex; flex-direction: column; }
    .stat-num { font-size: 22px; font-weight: 800; letter-spacing: -0.4px; line-height: 1.1; }
    .stat-name { font-size: 11px; color: var(--text-3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }

    .card-section-title { font-size: 13px; font-weight: 600; color: var(--text-2); margin: 0 0 8px; padding-bottom: 8px; border-bottom: 1px solid var(--sep); }
    .cat-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 0; border: none; background: none; width: 100%; cursor: pointer; color: var(--text); font-size: 13px; transition: opacity 120ms; }
    .cat-row:hover { opacity: 0.7; }
    .cat-name { font-weight: 500; }
    .cat-badge { font-size: 12px; font-weight: 700; background: var(--accent-light); color: var(--accent); padding: 2px 10px; border-radius: 99px; }

    /* ── List View ── */
    .list-view { display: flex; flex-direction: column; gap: 10px; }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .filter-chips { display: flex; gap: 6px; flex-shrink: 0; }

    .filter-chip {
      padding: 5px 12px;
      border-radius: 99px;
      border: 1px solid var(--sep);
      background: var(--surface);
      color: var(--text-2);
      font-size: 13px;
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
      padding: 5px 8px;
      font-size: 12px;
      outline: none;
      cursor: pointer;
    }

    .product-list { list-style: none; margin: 0; padding: 0 0 80px; display: flex; flex-direction: column; gap: 8px; }

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
    .product-card:hover { transform: translateY(-1px); box-shadow: var(--sh-md); }
    .product-card--unchecked { opacity: 0.65; }
    .product-card--unavail { filter: grayscale(0.6); }

    .prod-thumb-wrap {
      width: 88px;
      min-width: 88px;
      background: var(--surface-2);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
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
      top: 6px;
      left: 6px;
      background: var(--red);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 5px;
      border-radius: 99px;
    }

    .prod-body {
      flex: 1;
      min-width: 0;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .prod-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .prod-brand { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-3); }
    .prod-actions { display: flex; gap: 2px; margin-top: -4px; margin-right: -6px; }

    .prod-name {
      font-size: 14px;
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

    .prod-avail { display: flex; align-items: center; gap: 5px; }
    .avail-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .avail-label { font-size: 12px; font-weight: 500; }

    .prod-footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 6px;
    }

    .price-block { display: flex; flex-direction: column; }
    .price-current { font-size: 17px; font-weight: 800; letter-spacing: -0.3px; color: var(--text); }
    .price-original { font-size: 12px; text-decoration: line-through; color: var(--text-3); }

    .prod-controls { display: flex; gap: 6px; align-items: center; }

    .qty-control {
      display: flex;
      align-items: center;
      background: var(--surface-2);
      border-radius: 99px;
      padding: 2px;
      gap: 0;
    }

    .qty-btn {
      width: 30px; height: 30px;
      border: none; background: var(--surface);
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
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
      font-size: 14px;
      font-weight: 700;
      color: var(--text);
    }

    .cart-toggle-btn {
      background: var(--surface-3);
      color: var(--text-2);
      border: none;
      border-radius: 99px;
      padding: 0 14px;
      height: 32px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 150ms;
      white-space: nowrap;
      min-width: 44px;
    }
    .cart-toggle-btn:hover { background: var(--text); color: white; }
    .cart-toggle-btn--active { background: var(--green); color: white; }
    .cart-toggle-btn--active:hover { background: #28A745; }

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
    .icon-btn--watch-active { color: #FF9F0A !important; }
    .icon-btn--watch-active:hover { color: #CC7A00 !important; }
    .icon-btn--danger:hover { background: rgba(255,59,48,.1); color: var(--red); }

    .primary-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: var(--r-sm);
      padding: 10px 20px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms, transform 150ms;
      text-decoration: none;
    }
    .primary-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }
    .primary-btn[disabled] { opacity: 0.5; cursor: not-allowed; transform: none; }

    .secondary-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: var(--surface-2);
      color: var(--text-2);
      border: 1px solid var(--sep);
      border-radius: var(--r-sm);
      padding: 10px 20px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 150ms;
    }
    .secondary-btn:hover { background: var(--surface-3); }

    /* ── Action Bar ── */
    .action-bar {
      display: flex;
      gap: 10px;
      padding: 12px 16px;
      padding-bottom: max(12px, env(safe-area-inset-bottom));
      background: var(--surface);
      border-top: 1px solid var(--sep);
      flex-shrink: 0;
      box-shadow: 0 -4px 12px rgba(0,0,0,.04);
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 13px;
      border-radius: var(--r-sm);
      border: 1px solid var(--sep);
      background: var(--surface-2);
      color: var(--text);
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 150ms;
      min-height: 48px;
    }
    .action-btn:hover { background: var(--surface-3); }
    .action-btn--primary {
      background: var(--accent);
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(230,30,42,.25);
    }
    .action-btn--primary:hover { box-shadow: 0 6px 18px rgba(230,30,42,.35); }

    /* ── Map View ── */
    .map-view { display: flex; flex-direction: column; gap: 12px; height: 100%; }
    .leaflet-iframe {
      width: 100%; height: 320px;
      border: 1px solid var(--sep);
      border-radius: var(--r-md);
      background: var(--surface-2);
      flex-shrink: 0;
    }

    .pickup-list { list-style: none; margin: 0; padding: 0 0 80px; display: flex; flex-direction: column; gap: 8px; }

    .map-stores-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2px;
    }

    .section-heading { font: 700 17px/1 "Barlow Condensed", sans-serif; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-2); margin: 0; }

    .pickup-skeleton { display: flex; flex-direction: column; gap: 8px; }
    .pickup-skel-row { height: 64px; border-radius: var(--r-md); }

    .pickup-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      background: var(--surface);
      border: 1px solid var(--sep);
      border-radius: var(--r-md);
      box-shadow: var(--sh-sm);
      transition: transform 150ms, box-shadow 150ms;
    }
    .pickup-item:hover { transform: translateY(-2px); box-shadow: var(--sh-md); }
    .pickup-item--best { border-color: var(--accent); border-width: 2px; }

    .pickup-icon { color: var(--accent); flex-shrink: 0; }
    .pickup-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .pickup-name { font-size: 14px; font-weight: 600; color: var(--text); }
    .pickup-addr { font-size: 12px; color: var(--text-3); }
    .pickup-right { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .pickup-dist { font-size: 13px; font-weight: 700; color: var(--accent); }

    /* ── Recipes ── */
    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
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
    .recipe-card:hover { transform: translateY(-2px); box-shadow: var(--sh-md); }

    .recipe-img { width: 100%; height: 110px; object-fit: cover; display: block; }
    .recipe-img--placeholder { display: flex; align-items: center; justify-content: center; background: var(--surface-2); height: 110px; color: var(--text-3); }

    .recipe-body { padding: 8px 10px; flex: 1; }
    .recipe-title { font-size: 13px; font-weight: 600; color: var(--text); margin: 0 0 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .recipe-meta { display: flex; gap: 8px; flex-wrap: wrap; }
    .recipe-meta span { font-size: 11px; color: var(--text-3); }

    .recipe-actions {
      display: flex;
      gap: 6px;
      padding: 8px 10px;
      border-top: 1px solid var(--sep);
    }
    .recipe-btn {
      display: flex; align-items: center; gap: 4px;
      font-size: 12px; font-weight: 600;
      padding: 5px 10px;
      border-radius: var(--r-xs);
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: background 120ms;
    }
    .recipe-btn--link { background: var(--surface-2); color: var(--blue); }
    .recipe-btn--link:hover { background: rgba(0,122,255,.12); }
    .recipe-btn--add { background: var(--accent-light); color: var(--accent); }
    .recipe-btn--add:hover { background: rgba(230,30,42,.2); }

    /* ── Recipes enhanced ── */
    .recipes-header { display: flex; align-items: center; justify-content: space-between; padding: 0 2px 10px; }
    .recipes-count { font-size: 12px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.5px; }

    .recipes-skeleton { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
    .recipe-skel-card { background: var(--surface); border-radius: var(--r-md); overflow: hidden; }
    .skel-img { width: 100%; height: 110px; }

    .recipe-img-wrap { position: relative; background: var(--surface-2); }
    .recipe-img-wrap .recipe-img { width: 100%; height: 110px; object-fit: cover; display: block; }
    .recipe-img-wrap .recipe-img--placeholder { display: flex; align-items: center; justify-content: center; height: 110px; color: var(--text-3); }
    .recipe-badge {
      position: absolute; bottom: 6px; right: 6px;
      background: rgba(0,0,0,.55); color: white;
      font-size: 10px; font-weight: 700; padding: 2px 6px;
      border-radius: 99px; backdrop-filter: blur(4px);
    }
    .recipe-card { cursor: pointer; }
    .recipe-card:hover { transform: translateY(-2px); box-shadow: var(--sh-md); }

    /* ── Recipe Modal ── */
    .recipe-modal { border-radius: var(--r-xl); padding: 0; overflow: hidden; gap: 0; }

    .recipe-modal-title-wrap { flex: 1; display: flex; flex-direction: column; gap: 3px; }
    .recipe-modal-meta { font-size: 12px; color: var(--text-3); font-weight: 500; }
    .recipe-modal .modal-header { padding: 16px 16px 12px; border-bottom: 1px solid var(--sep); }

    .recipe-modal-img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
      flex-shrink: 0;
    }

    .recipe-modal-loading {
      display: flex; align-items: center; gap: 10px;
      padding: 24px 16px; color: var(--text-2); font-size: 14px;
    }

    /* ── Ingredients checklist ── */
    .ingredients-section { padding: 12px 16px 0; }
    .ingredients-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .ingredients-sel-actions { display: flex; gap: 6px; }

    .text-btn {
      background: none; border: none;
      color: var(--accent); font-size: 12px; font-weight: 600;
      cursor: pointer; padding: 2px 6px; border-radius: var(--r-xs);
      transition: background 120ms;
    }
    .text-btn:hover { background: var(--accent-light); }

    .recipe-ingredients-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; max-height: 240px; overflow-y: auto; }
    .recipe-no-ing { font-size: 13px; color: var(--text-3); padding: 12px 0; text-align: center; }
    .recipe-no-ing--safe { display: flex; flex-direction: column; gap: 5px; padding: 14px; border: 1px solid var(--sep); border-left: 3px solid var(--accent); border-radius: var(--r-sm); background: var(--surface-2); text-align: left; }
    .recipe-no-ing--safe strong { color: var(--text); font-size: 13px; }
    .recipe-no-ing--safe span { line-height: 1.35; }

    .recipe-ing-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px;
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
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: var(--accent);
      background: var(--surface);
      transition: all 120ms;
    }
    .recipe-ing-item--checked .recipe-ing-check { background: var(--accent); color: white; border-color: var(--accent); }
    .recipe-ing-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
    .recipe-ing-name { font-size: 13px; line-height: 1.25; color: var(--text); }
    .recipe-ing-name strong { color: var(--accent); font-variant-numeric: tabular-nums; }
    .recipe-ing-meta { display: flex; align-items: center; gap: 5px; color: var(--text-3); font-size: 10px; letter-spacing: .02em; }
    .recipe-ing-meta strong { color: var(--accent); font-size: 11px; font-variant-numeric: tabular-nums; }
    .recipe-ing-thumb { width: 42px; height: 42px; flex: 0 0 42px; object-fit: contain; border-radius: var(--r-xs); background: var(--surface); }

    /* ── Import actions ── */
    .recipe-import-actions { padding: 12px 16px 16px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--sep); margin-top: 8px; }
    .recipe-list-selector { display: flex; align-items: center; gap: 8px; }
    .recipe-list-label { font-size: 13px; font-weight: 600; color: var(--text-2); white-space: nowrap; display: flex; align-items: center; gap: 4px; }
    .recipe-list-selector .header-select { flex: 1; }
    .recipe-import-btns { display: flex; gap: 8px; align-items: stretch; }

    /* ── Import result ── */
    .recipe-import-result { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    .import-result-row { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; color: var(--text); }
    .import-not-found { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .import-not-found-label { font-size: 12px; font-weight: 600; color: var(--text-3); }
    .import-not-found-item { font-size: 12px; background: rgba(255,59,48,.1); color: var(--red); padding: 2px 8px; border-radius: 99px; }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.6);
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
      padding: 20px;
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      box-shadow: 0 -4px 32px rgba(0,0,0,.2);
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
      font-size: 16px;
      font-weight: 700;
    }
    .modal-title { display: flex; align-items: center; gap: 8px; }

    .modal-card--addr { max-width: 400px; }

    .qr-container { background: white; padding: 12px; border-radius: var(--r-md); align-self: center; }
    .url-row { display: flex; gap: 8px; width: 100%; }
    .url-input { flex: 1; background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-sm); color: var(--text-3); padding: 8px 12px; font-size: 12px; outline: none; overflow: hidden; text-overflow: ellipsis; }

    /* ── Address Modal Fields ── */
    .addr-field { display: flex; flex-direction: column; gap: 8px; }
    .field-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-3); }
    .chip-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .chip { padding: 6px 14px; border-radius: 99px; border: 1.5px solid var(--sep); background: var(--surface-2); color: var(--text-2); cursor: pointer; font-size: 13px; font-weight: 500; transition: all 120ms; }
    .chip--active { background: var(--accent-light); border-color: var(--accent); color: var(--accent); font-weight: 600; }
    .input-wrap { position: relative; display: flex; align-items: center; gap: 8px; }
    .suggestions { list-style: none; margin: 0; padding: 0; background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-md); max-height: 180px; overflow-y: auto; animation: slideDown 150ms ease-out; }
    .suggestion-row { display: flex; align-items: flex-start; gap: 8px; padding: 9px 12px; cursor: pointer; border-bottom: 1px solid var(--sep); transition: background 100ms; font-size: 13px; color: var(--text); }
    .suggestion-row:last-child { border-bottom: none; }
    .suggestion-row:hover { background: var(--surface); }
    .addr-selected { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--green); padding: 8px 12px; background: rgba(52,199,89,.1); border-radius: var(--r-sm); border: 1px solid rgba(52,199,89,.25); }
    .addr-actions { display: flex; justify-content: space-between; gap: 10px; }

    /* ── Custom Dialog ── */
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.5);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 120ms ease;
    }

    .dialog-sheet {
      background: var(--surface);
      border-radius: var(--r-xl) var(--r-xl) 0 0;
      padding: 24px 20px;
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      animation: slideUp 180ms ease-out;
    }

    @media (min-width: 480px) {
      .dialog-overlay { align-items: center; }
      .dialog-sheet { border-radius: var(--r-xl); }
    }

    .dialog-message { margin: 0; font-size: 16px; font-weight: 600; color: var(--text); text-align: center; }
    .dialog-input { background: var(--surface-2); border: 1.5px solid var(--sep); border-radius: var(--r-sm); color: var(--text); padding: 12px; font-size: 15px; outline: none; width: 100%; box-sizing: border-box; transition: border-color 150ms; }
    .dialog-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
    .dialog-actions { display: flex; gap: 10px; }
    .dialog-btn { flex: 1; padding: 13px; border: none; border-radius: var(--r-sm); font-size: 16px; font-weight: 600; cursor: pointer; transition: background 150ms; min-height: 48px; }
    .dialog-btn--cancel { background: var(--surface-2); color: var(--text-2); }
    .dialog-btn--cancel:hover { background: var(--surface-3); }
    .dialog-btn--confirm { background: var(--accent); color: white; }
    .dialog-btn--confirm:hover { background: var(--accent-hover); }
    .dialog-btn--danger { background: var(--red); color: white; }
    .dialog-btn--danger:hover { background: #CC2E24; }

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
    .skeleton-body { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 14px; }
    .skeleton-line { height: 12px; border-radius: 6px; }
    .skeleton-line--short { width: 40%; }
    .skeleton-line--med { width: 65%; }

    /* ── Empty state ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 60px 20px;
      text-align: center;
      color: var(--text-2);
    }
    .empty-state h3 { margin: 0; font-size: 18px; font-weight: 700; color: var(--text); }
    .empty-state p { margin: 0; font-size: 14px; color: var(--text-3); }

    .loading-center { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: var(--text-3); font-size: 14px; }

    /* ── Toast ── */
    .toast {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      padding: 12px 20px;
      border-radius: var(--r-sm);
      font-size: 14px;
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
    .chef-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin: 4px 0 18px; }
    .chef-header h1, .chef-plan h2 { margin: 3px 0 6px; font: 800 32px/1.08 "Barlow Condensed", sans-serif; color: var(--text); }
    .chef-header p, .chef-plan-head p { margin: 0; color: var(--text-2); line-height: 1.45; }
    .chef-kicker { color: var(--accent); text-transform: uppercase; letter-spacing: .09em; font-size: 11px; font-weight: 800; }
    .chef-account { display: flex; align-items: center; gap: 8px; color: var(--text-3); font-size: 12px; }
    .chef-account > span { display: flex; align-items: center; gap: 6px; }
    .chef-account i, .chef-waiting i { width: 8px; height: 8px; display: inline-block; border-radius: 50%; background: #00a651; box-shadow: 0 0 0 4px rgba(0,166,81,.12); }

    .chef-composer { position: relative; padding: 14px; background: var(--surface); border: 1px solid var(--sep); border-radius: 22px; box-shadow: var(--sh-md); }
    .chef-composer textarea { width: 100%; min-height: 94px; resize: vertical; box-sizing: border-box; padding: 5px 52px 10px 4px; border: 0; outline: 0; color: var(--text); background: transparent; font: 500 16px/1.45 inherit; }
    .chef-send { position: absolute; right: 16px; top: 16px; width: 42px; height: 42px; display: grid; place-items: center; color: #fff; background: var(--accent); border: 0; border-radius: 14px; cursor: pointer; }
    .chef-chips { display: flex; gap: 7px; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid var(--sep); }
    .chef-chips button { padding: 7px 11px; border: 1px solid var(--sep); border-radius: 99px; color: var(--text-2); background: var(--surface-2); font-size: 12px; cursor: pointer; }
    .chef-chips button:hover { border-color: var(--accent); color: var(--accent); }

    .chef-settings { margin-bottom: 14px; padding: 16px; background: var(--surface-2); border: 1px solid var(--sep); border-radius: var(--r-lg); }
    .chef-settings-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
    .chef-settings label { display: flex; flex-direction: column; gap: 6px; color: var(--text-2); font-size: 12px; font-weight: 700; }
    .chef-settings input, .chef-settings select, .chef-import-bar select { min-height: 40px; padding: 8px 10px; box-sizing: border-box; border: 1px solid var(--sep); border-radius: 10px; color: var(--text); background: var(--surface); font: inherit; }
    .chef-settings .chef-wide { grid-column: span 3; }
    .chef-save { margin-top: 12px; }

    .chef-loading, .chef-thinking { min-height: 180px; display: flex; align-items: center; justify-content: center; gap: 14px; color: var(--text-2); }
    .chef-thinking { min-height: 120px; margin-top: 14px; border: 1px dashed var(--sep); border-radius: var(--r-lg); }
    .chef-thinking > div:last-child { display: flex; flex-direction: column; gap: 3px; }
    .chef-thinking span { font-size: 12px; color: var(--text-3); }
    .chef-onboarding { min-height: 360px; max-width: 560px; margin: 24px auto; padding: 34px; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; background: var(--surface); border: 1px solid var(--sep); border-radius: 24px; box-shadow: var(--sh-md); }
    .chef-onboarding h2 { margin: 0; font: 800 28px/1.1 "Barlow Condensed", sans-serif; }
    .chef-onboarding p { max-width: 470px; margin: 0 0 5px; color: var(--text-2); line-height: 1.55; }
    .chef-avatar { width: 54px; height: 54px; display: grid; place-items: center; border-radius: 18px; color: #fff; background: linear-gradient(145deg, #e30613, #f05a67); font: 800 17px/1 "Barlow Condensed", sans-serif; box-shadow: 0 10px 24px rgba(227,6,19,.22); }
    .chef-error { padding: 9px 12px; border-radius: 9px; color: #9f1c24; background: rgba(227,6,19,.09); font-size: 12px; }
    .chef-device-code { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .chef-device-code > strong { padding: 12px 18px; border: 1px dashed var(--accent); border-radius: 12px; background: var(--accent-light); color: var(--accent); font: 800 25px/1 monospace; letter-spacing: .12em; }
    .chef-device-code > div { display: flex; gap: 8px; }
    .chef-waiting { display: flex; align-items: center; gap: 8px; color: var(--text-3); font-size: 12px; }

    .chef-clarification { margin-top: 14px; padding: 18px; display: flex; align-items: center; gap: 14px; border: 1px solid var(--sep); border-radius: var(--r-lg); background: var(--surface); }
    .chef-clarification .chef-avatar { width: 42px; height: 42px; border-radius: 13px; }
    .chef-clarification p { margin: 4px 0 0; color: var(--text-2); }
    .chef-plan { margin-top: 16px; overflow: hidden; border: 1px solid var(--sep); border-radius: 22px; background: var(--surface); box-shadow: var(--sh-sm); }
    .chef-plan-head { padding: 22px; display: flex; justify-content: space-between; gap: 18px; background: linear-gradient(135deg, var(--surface), var(--accent-light)); }
    .chef-plan-head > div:first-child { max-width: 720px; }
    .chef-plan h2 { font-size: 29px; }
    .chef-meta { display: flex; align-items: flex-start; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
    .chef-meta span { padding: 6px 9px; border-radius: 99px; color: var(--text-2); background: var(--surface); border: 1px solid var(--sep); font-size: 11px; font-weight: 700; }
    .chef-plan-section { padding: 20px 22px; border-top: 1px solid var(--sep); }
    .chef-plan-section h3 { margin: 0 0 4px; font: 800 20px/1.2 "Barlow Condensed", sans-serif; }
    .chef-help { margin: 0 0 16px; color: var(--text-3); font-size: 12px; }
    .chef-ingredients { display: flex; flex-direction: column; gap: 14px; }
    .chef-ingredient { display: grid; grid-template-columns: minmax(160px, .7fr) minmax(0, 2fr); gap: 14px; align-items: start; }
    .chef-ingredient-title { display: flex; gap: 9px; align-items: flex-start; padding-top: 8px; }
    .chef-ingredient-title > span { width: 24px; height: 24px; display: grid; place-items: center; flex: 0 0 24px; border-radius: 8px; color: var(--accent); background: var(--accent-light); font-size: 11px; font-weight: 800; }
    .chef-ingredient-title div { display: flex; flex-direction: column; gap: 3px; }
    .chef-ingredient-title strong { font-size: 14px; color: var(--text); }
    .chef-ingredient-title small { color: var(--text-3); }
    .chef-ingredient-title button { align-self: flex-start; margin: 3px 0 0; padding: 0; border: 0; color: var(--accent); background: transparent; font-size: 10px; cursor: pointer; }
    .chef-products { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; }
    .chef-product { position: relative; min-width: 0; padding: 9px; display: flex; align-items: center; gap: 9px; text-align: left; color: var(--text); background: var(--surface-2); border: 1px solid var(--sep); border-radius: 13px; cursor: pointer; }
    .chef-product:hover { border-color: color-mix(in srgb, var(--accent) 45%, var(--sep)); }
    .chef-product--selected { border: 2px solid var(--accent); padding: 8px; background: var(--accent-light); }
    .chef-product-check { position: absolute; right: 7px; top: 7px; width: 18px; height: 18px; display: grid; place-items: center; color: #fff; background: var(--accent); border-radius: 50%; font-size: 10px; }
    .chef-product:not(.chef-product--selected) .chef-product-check { background: transparent; border: 1px solid var(--sep); }
    .chef-product img, .chef-product-placeholder { width: 54px; height: 54px; flex: 0 0 54px; object-fit: contain; border-radius: 9px; background: #fff; }
    .chef-product-placeholder { display: grid; place-items: center; color: var(--text-3); }
    .chef-product-copy { min-width: 0; display: flex; flex-direction: column; gap: 3px; padding-right: 14px; }
    .chef-product-copy strong { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; font-size: 11px; line-height: 1.25; }
    .chef-product-copy small { color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 9px; }
    .chef-product-copy span { color: var(--text-2); font-size: 10px; }
    .chef-product-copy b { color: var(--accent); font-size: 12px; }
    .chef-no-match { padding: 12px; border-radius: 11px; color: var(--text-3); background: var(--surface-2); font-size: 12px; }
    .chef-steps ol { margin: 14px 0 0; padding-left: 24px; display: grid; gap: 9px; color: var(--text-2); line-height: 1.45; }
    .chef-import-bar { position: sticky; bottom: 0; padding: 13px 18px; display: flex; align-items: center; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--sep); background: color-mix(in srgb, var(--surface) 92%, transparent); backdrop-filter: blur(12px); }
    .chef-import-bar > div { margin-right: auto; display: flex; flex-direction: column; }
    .chef-import-bar > div span { color: var(--text-3); font-size: 11px; }

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
      .chef-plan-section, .chef-plan-head { padding: 16px; }
      .chef-meta { justify-content: flex-start; }
      .chef-import-bar { align-items: stretch; flex-direction: column; }
      .chef-import-bar > div { margin: 0; flex-direction: row; justify-content: space-between; }
      .chef-onboarding { min-height: 300px; margin: 10px auto; padding: 24px 18px; }
    }

    /* ── Address Bottom Sheet (mobile) ── */
    .sheet-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.55);
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
      box-shadow: 0 -8px 32px rgba(0,0,0,.25);
    }

    .sheet-handle {
      width: 36px;
      height: 4px;
      background: var(--surface-3);
      border-radius: 99px;
      margin: 10px auto 0;
      flex-shrink: 0;
    }

    .sheet-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 16px 10px;
      border-bottom: 1px solid var(--sep);
      flex-shrink: 0;
    }
    .sheet-title {
      flex: 1;
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
    }

    .sheet-body {
      overflow-y: auto;
      flex: 1;
      padding: 8px 0;
    }

    .sheet-addr-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
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
    .sheet-addr-label { font-size: 15px; font-weight: 600; color: var(--text); }
    .sheet-addr-sub { font-size: 12px; color: var(--text-3); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sheet-addr-check { color: var(--accent); flex-shrink: 0; }

    .sheet-empty { padding: 24px 16px; font-size: 14px; color: var(--text-3); text-align: center; margin: 0; }

    .sheet-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--sep);
      flex-shrink: 0;
      padding-bottom: max(16px, env(safe-area-inset-bottom));
    }

    .sheet-add-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 13px;
      border: 1.5px dashed var(--sep);
      background: none;
      border-radius: var(--r-md);
      color: var(--text-2);
      font-size: 15px;
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
        box-shadow: 0 -2px 12px rgba(0,0,0,.08);
      }

      .mobile-bottom-nav .tab {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 6px 4px;
        background: none;
        border: none;
        border-top: 2px solid transparent;
        color: var(--text-3);
        cursor: pointer;
        font-size: 10px;
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

      .mobile-bottom-nav .tab-label { font-size: 10px; }
    }

    /* Desktop: hide bottom nav (handled by sidebar) */
    @media (min-width: 768px) {
      .mobile-bottom-nav { display: none !important; }
    }
  `);customElements.get("auchan-grocery-panel")||customElements.define("auchan-grocery-panel",j);
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
