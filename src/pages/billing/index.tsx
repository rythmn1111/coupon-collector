import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    // AlertDialogDescription,
    AlertDialogFooter,
    // AlertDialogHeader,
    // AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { useRouter } from "next/router"


export default function Billing() {
    const router = useRouter();
    return <>
    <div className="min-h-screen bg-black">
        <div className="h-20 bg-orange-600 flex justify-center items-center">
            <h1 className="text-white font-bold font-mono text-5xl">Billing</h1>
        </div>
        <div className="h-[calc(100vh-8rem)] flex justify-center items-center  flex-col gap-5">
        <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button className="bg-orange-800 hover:bg-orange-600 font-mono text-white text-3xl px-10 py-14 w-[300px]">create new bill</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-black-600">
        <AlertDialogAction className="bg-slate-50 hover:bg-slate-400 text-black" onClick={()=>{router.push('/billing/new_bill')}}>Existing User</AlertDialogAction>
        <AlertDialogAction className="bg-slate-50 hover:bg-slate-400 text-black" >Create New User</AlertDialogAction>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
        <Button className="bg-orange-800 hover:bg-orange-600 text-white font-mono text-3xl px-10 py-14 w-[300px]">show all bill</Button>
        </div>
    </div>
    </>
}
