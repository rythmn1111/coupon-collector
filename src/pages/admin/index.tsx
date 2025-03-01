import React from "react";
import Flowy from "./flowy";
import Header from "./header";
import Flowy2 from "./flowy2";
import Bar1 from "./bar";
export default function Admin() {
  return <>
   
    <div className="mt-4 ml-4">

    <div className="mb-4">
        <Header></Header>
        </div>
    <Flowy />
    <div className="flex w-full flex-row">
        <div className="flex-1">
            <Flowy2></Flowy2>
        </div>
    <div className="flex-1">

        <Bar1></Bar1>
        </div>
    </div>
</div>
    
    
  </>
}