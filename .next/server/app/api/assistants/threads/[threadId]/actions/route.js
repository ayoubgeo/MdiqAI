"use strict";(()=>{var e={};e.id=548,e.ids=[548],e.modules={517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},1017:e=>{e.exports=require("path")},5477:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},1267:e=>{e.exports=require("worker_threads")},9796:e=>{e.exports=require("zlib")},4910:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>l,originalPathname:()=>q,patchFetch:()=>m,requestAsyncStorage:()=>d,routeModule:()=>p,serverHooks:()=>c,staticGenerationAsyncStorage:()=>h,staticGenerationBailout:()=>x});var s={};r.r(s),r.d(s,{POST:()=>n});var a=r(5419),o=r(9108),i=r(9678),u=r(7974);async function n(e,{params:{threadId:t}}){let{toolCallOutputs:r,runId:s}=await e.json(),a=u.f.beta.threads.runs.submitToolOutputsStream(t,s,{tool_outputs:r});return new Response(a.toReadableStream())}let p=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/assistants/threads/[threadId]/actions/route",pathname:"/api/assistants/threads/[threadId]/actions",filename:"route",bundlePath:"app/api/assistants/threads/[threadId]/actions/route"},resolvedPagePath:"D:\\CARTOINWGS84\\python\\Mdiq\\app\\api\\assistants\\threads\\[threadId]\\actions\\route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:d,staticGenerationAsyncStorage:h,serverHooks:c,headerHooks:l,staticGenerationBailout:x}=p,q="/api/assistants/threads/[threadId]/actions/route";function m(){return(0,i.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:h})}},7974:(e,t,r)=>{r.d(t,{f:()=>s});let s=new(r(2917)).ZP}};var t=require("../../../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[638,746],()=>r(4910));module.exports=s})();