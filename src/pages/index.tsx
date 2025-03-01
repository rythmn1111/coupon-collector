import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"

export default function Home() {
    const router = useRouter();
    return <>
    <div className="min-h-screen bg-black">
        <div className="h-20 bg-orange-600 flex justify-center items-center">
            <h1 className="text-white font-bold font-degular font-black text-5xl">God Mode</h1>
        </div>
        <div className="h-[calc(100vh-8rem)] flex justify-center items-center  flex-col gap-5">
        <Button className="bg-orange-800 hover:bg-orange-600 font-mono text-white text-3xl px-10 py-14 w-[300px]" onClick={()=>{
  router.push('/admin')
}}>Admin Panel</Button>
<Button className="bg-orange-800 hover:bg-orange-600 text-white font-mono text-3xl px-10 py-14 w-[300px]" onClick={()=>{
  router.push('/billing')
}}>Billing Panel
</Button>
        </div>
    </div>
    </>
}
