import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Test() {
    const [response, setResponse] = useState<string>("");



    const handleClick = async () => {
        try{
            const res = await fetch('http://localhost:3001/');
            const data = await res.json();
            setResponse(data.message);

        }
        catch(error){
            console.error('Error fetching data:', error);
            setResponse('Error connecting to server');

        }
    }

    return <>
    <Button  onClick={handleClick} className="bg-orange-800 hover:bg-orange-600 font-mono text-white text-3xl px-10 py-14 w-[300px]">send req</Button>
    {/* {response && <p className="mt-4">{response}</p>} */}
    <h1 className="text-red-500 text-5xl">{response}</h1>
    </>
}