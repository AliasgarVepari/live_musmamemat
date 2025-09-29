import{d as a,r as x,j as e}from"./app-Bky3aKG0.js";import{D as p,b as u,c as y,d as f,e as k,f as j}from"./dialog-CInzwclF.js";import{B as t}from"./button-BsOJNgmv.js";import{T as v}from"./textarea-DN8Q85Yw.js";import{L as g}from"./label-7LBn3At3.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],M=a("ShieldCheck",N);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m14.5 9.5-5 5",key:"17q4r4"}],["path",{d:"m9.5 9.5 5 5",key:"18nt4w"}]],X=a("ShieldX",C);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]],E=a("UserCheck",w);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"17",x2:"22",y1:"8",y2:"13",key:"3nzzx3"}],["line",{x1:"22",x2:"17",y1:"8",y2:"13",key:"1swrse"}]],b=a("UserX",D),H=({open:i,onOpenChange:r,onConfirm:c,userName:l,isSuspending:n})=>{const[s,o]=x.useState(""),d=()=>{if(!s.trim()){alert("Please provide a reason for suspension.");return}c(s),o(""),r(!1)},m=()=>{o(""),r(!1)};return e.jsx(p,{open:i,onOpenChange:r,children:e.jsxs(u,{className:"bg-white sm:max-w-md",children:[e.jsx(y,{children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex-shrink-0",children:e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600",children:e.jsx(b,{className:"h-5 w-5"})})}),e.jsxs("div",{children:[e.jsx(f,{className:"text-lg font-semibold",children:"Suspend User Account"}),e.jsxs(k,{className:"text-muted-foreground mt-1 text-sm",children:['Are you sure you want to suspend "',l,'"? Please provide a reason for this action.']})]})]})}),e.jsx("div",{className:"space-y-4",children:e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{htmlFor:"suspension-reason",children:"Reason for suspension"}),e.jsx(v,{id:"suspension-reason",value:s,onChange:h=>o(h.target.value),placeholder:"Enter the reason for suspending this user...",className:"mt-1",rows:4,required:!0})]})}),e.jsxs(j,{className:"gap-3",children:[e.jsx(t,{variant:"outline",onClick:m,disabled:n,children:"Cancel"}),e.jsx(t,{variant:"destructive",onClick:d,disabled:!s.trim()||n,children:n?"Suspending...":"Suspend User"})]})]})})};export{H as S,b as U,E as a,M as b,X as c};
