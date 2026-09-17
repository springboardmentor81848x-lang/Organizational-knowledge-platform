import React from "react";
import { Loader2, Search, AlertTriangle } from "lucide-react";

export const useHrResource = <T,>(loader:()=>Promise<T>, initial:T) => {
  const [data,setData]=React.useState<T>(initial); const [loading,setLoading]=React.useState(true); const [error,setError]=React.useState("");
  const load=React.useCallback(async()=>{setLoading(true);setError("");try{setData(await loader())}catch(e:any){setError(e?.response?.data?.message||e?.response?.data?.error||e?.message||"Unable to load data.")}finally{setLoading(false)}},[loader]);
  React.useEffect(()=>{load()},[load]); return {data,setData,loading,error,reload:load};
};

export const PageState:React.FC<{loading:boolean;error?:string;empty?:boolean;emptyText?:string}> = ({loading,error,empty,emptyText="No records found."}) => {
  if(loading)return <div className="hr-loading"><Loader2 size={18} className="spin"/> Loading live database data…</div>;
  if(error)return <div className="hr-error"><AlertTriangle size={18}/> <strong>Unable to load data</strong><div>{error}</div></div>;
  if(empty)return <div className="hr-empty">{emptyText}</div>; return null;
};

export const SearchBox:React.FC<{value:string;onChange:(v:string)=>void;placeholder?:string}> = ({value,onChange,placeholder="Search…"}) => <div className="hr-search"><Search size={15}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>;

export const fmtPct=(v:any)=>`${Number(v||0).toFixed(1)}%`;
export const titleCase=(v:any)=>String(v??"").toLowerCase().replace(/_/g," ").replace(/\b\w/g,m=>m.toUpperCase());
