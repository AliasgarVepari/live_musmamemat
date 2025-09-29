import{r as m,j as e,H as D,L as u,a as h}from"./app-CiN-z-mi.js";import{B as l}from"./badge-BeEVwe-7.js";import{B as c}from"./button-CwwqYzBh.js";import{C as g,a as f,b as p,d as v,c as j}from"./card-C9ipyH0f.js";import{C as _}from"./confirmation-dialog-BEa2v6Bs.js";import{I as A}from"./input-BtLlCDAq.js";import{A as I,T as b}from"./app-layout-DTXGJZxa.js";import{P as z}from"./plus-D85O9q-4.js";import{S as B}from"./search-B2lordE5.js";import{a as M,T as $}from"./toggle-right-BeZ5vh-S.js";import{S as E}from"./square-pen-CNo-uToz.js";import{T as F}from"./trash-2-7epWCtSP.js";import"./index-Nuw4A2-P.js";import"./dialog-CFbaL1bR.js";import"./index-DtnZEJZD.js";import"./chevron-right-BYcuDYwb.js";import"./index-CDOJiyEw.js";import"./index-DW9AIAM8.js";import"./base-layout-DZyBKCCS.js";/* empty css            */import"./use-forced-theme-CWthfpdt.js";import"./settings-DUw5aPq3.js";import"./logo-DB6pQEXk.js";import"./map-pin-W1PPpquu.js";import"./crown-CQOnRZo_.js";const H=[{title:"Categories",href:"/admin/categories"}];function xe({categories:y,filters:C}){const[i,N]=m.useState(""),[a,w]=m.useState(C?.status||"all"),[n,x]=m.useState({open:!1,title:"",description:"",onConfirm:()=>{}}),k=(s,r)=>{const o=document.querySelector(".error-dialog-overlay");o&&o.remove();const t=document.createElement("div");t.className="error-dialog-overlay",t.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
            background-color: rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.2s ease-out;
        `,t.innerHTML=`
            <div style="
                background: white;
                border-radius: 0.5rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                max-width: 28rem;
                width: 100%;
                margin: 1rem;
                animation: slideIn 0.2s ease-out;
            ">
                <div style="padding: 1.5rem;">
                    <div style="display: flex; align-items: center;">
                        <div style="flex-shrink: 0;">
                            <svg style="height: 1.5rem; width: 1.5rem; color: #dc2626;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div style="margin-left: 0.75rem; font-size: 1.125rem; font-weight: 500; color: #111827;">${s}</div>
                    </div>
                    <div style="margin-top: 1.5rem; font-size: 0.875rem; color: #374151;">${r}</div>
                </div>
                <div style="padding: 1.5rem; padding-top: 0; display: flex; justify-content: flex-end;">
                    <button 
                        onclick="this.closest('.error-dialog-overlay').remove()"
                        style="
                            display: inline-flex;
                            align-items: center;
                            padding: 0.5rem 1rem;
                            border: 1px solid transparent;
                            font-size: 0.875rem;
                            font-weight: 500;
                            border-radius: 0.375rem;
                            color: white;
                            background-color: #dc2626;
                            transition: background-color 0.2s;
                            cursor: pointer;
                        "
                        onmouseover="this.style.backgroundColor='#b91c1c'"
                        onmouseout="this.style.backgroundColor='#dc2626'"
                    >
                        OK
                    </button>
                </div>
            </div>
        `,document.body.appendChild(t),setTimeout(()=>{t.parentNode&&t.parentNode.removeChild(t)},1e4)},S=s=>{h.patch(`/admin/categories/${s}/toggle`,{},{preserveState:!0})},T=s=>{x({open:!0,title:"Delete Category",description:"Are you sure you want to delete this category? This action cannot be undone.",onConfirm:()=>{h.delete(`/admin/categories/${s}`,{preserveScroll:!0,onError:r=>{const t=Object.values(r).flat().join(", ");k("Cannot Delete Category",t)}})}})},d=(y?.data||[]).filter(s=>{const r=s.name_en.toLowerCase().includes(i.toLowerCase())||s.name_ar.toLowerCase().includes(i.toLowerCase())||s.slug.toLowerCase().includes(i.toLowerCase()),o=a==="all"||a==="active"&&s.status==="active"||a==="inactive"&&s.status==="inactive";return r&&o}),L=s=>{switch(s){case"active":return e.jsx(l,{className:"bg-green-100 text-green-800",children:"Active"});case"inactive":return e.jsx(l,{className:"bg-gray-100 text-gray-800",children:"Inactive"});default:return e.jsx(l,{className:"bg-gray-100 text-gray-800",children:s})}};return e.jsxs(I,{breadcrumbs:H,children:[e.jsxs(e.Fragment,{children:[e.jsx(D,{title:"Categories",children:e.jsx("style",{children:`
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            @keyframes slideIn {
                                from { 
                                    opacity: 0; 
                                    transform: translateY(-10px) scale(0.95); 
                                }
                                to { 
                                    opacity: 1; 
                                    transform: translateY(0) scale(1); 
                                }
                            }
                        `})}),e.jsxs("div",{className:"flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"Categories"}),e.jsx("p",{className:"text-muted-foreground",children:"Manage product categories"})]}),e.jsx(c,{asChild:!0,children:e.jsxs(u,{href:"/admin/categories/create",children:[e.jsx(z,{className:"mr-2 h-4 w-4"}),"Add Category"]})})]}),e.jsxs(g,{children:[e.jsxs(f,{children:[e.jsx(p,{children:"Filters"}),e.jsx(v,{children:"Filter categories by name or status"})]}),e.jsx(j,{children:e.jsxs("div",{className:"flex flex-col gap-4 sm:flex-row",children:[e.jsx("div",{className:"flex-1",children:e.jsxs("div",{className:"relative",children:[e.jsx(B,{className:"text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"}),e.jsx(A,{placeholder:"Search categories...",value:i,onChange:s=>N(s.target.value),className:"pl-10"})]})}),e.jsx("div",{className:"sm:w-48",children:e.jsxs("select",{value:a,onChange:s=>w(s.target.value),className:"border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",children:[e.jsx("option",{value:"all",children:"All Status"}),e.jsx("option",{value:"active",children:"Active"}),e.jsx("option",{value:"inactive",children:"Inactive"})]})})]})})]}),e.jsxs(g,{children:[e.jsxs(f,{children:[e.jsxs(p,{children:["Categories (",d.length,")"]}),e.jsx(v,{children:"A list of all categories in the system"})]}),e.jsx(j,{children:d.length===0?e.jsxs("div",{className:"py-8 text-center",children:[e.jsx(b,{className:"text-muted-foreground mx-auto h-12 w-12"}),e.jsx("h3",{className:"mt-2 text-sm font-semibold text-gray-900",children:"No categories found"}),e.jsx("p",{className:"text-muted-foreground mt-1 text-sm",children:i||a!=="all"?"Try adjusting your search or filter criteria.":"Get started by creating a new category."})]}):e.jsx("div",{className:"space-y-4",children:d.map(s=>e.jsxs("div",{className:"hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4",children:[e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsx("div",{className:"bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg",children:s.icon_url?e.jsx("img",{src:s.icon_url,alt:`${s.name_en} icon`,className:"h-6 w-6 object-contain"}):e.jsx(b,{className:"text-primary h-5 w-5"})}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx("h3",{className:"font-medium",children:s.name_en}),L(s.status),s.sort_order&&e.jsxs(l,{variant:"outline",className:"text-xs",children:["Order: ",s.sort_order]})]}),e.jsxs("div",{className:"text-muted-foreground flex items-center space-x-4 text-sm",children:[e.jsxs("span",{children:["Arabic: ",s.name_ar]}),e.jsx("span",{children:"•"}),e.jsxs("span",{children:["Slug: ",s.slug]})]})]})]}),e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(c,{variant:"ghost",size:"sm",onClick:()=>S(s.id),children:s.status==="active"?e.jsx(M,{className:"h-4 w-4 text-green-500"}):e.jsx($,{className:"h-4 w-4 text-gray-400"})}),e.jsx(c,{variant:"ghost",size:"sm",asChild:!0,children:e.jsx(u,{href:`/admin/categories/${s.id}/edit`,children:e.jsx(E,{className:"h-4 w-4"})})}),e.jsx(c,{variant:"ghost",size:"sm",onClick:()=>T(s.id),className:"text-destructive hover:text-destructive",children:e.jsx(F,{className:"h-4 w-4"})})]})]},s.id))})})]})]})]}),e.jsx(_,{open:n.open,onOpenChange:s=>x(r=>({...r,open:s})),title:n.title,description:n.description,onConfirm:n.onConfirm,confirmText:"Delete",cancelText:"Cancel"})]})}export{xe as default};
