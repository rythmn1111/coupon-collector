import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"


import {
    InputOTP,
    InputOTPGroup,
    // InputOTPSeparator,
    InputOTPSlot,
  } from "@/components/ui/input-otp"
  
  export default function InputOTPDemo() {
      const router = useRouter();
      return <>
      <div className="flex flex-col justify-center items-center h-screen bg-black">
      <h1 className="text-2xl mb-2">Enter the OTP</h1>
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot className="border-gray-300" index={0} />
          <InputOTPSlot className="border-gray-300"  index={1} />
          <InputOTPSlot className="border-gray-300" index={2} />
        {/* </InputOTPGroup> */}
        {/* <InputOTPSeparator /> */}
        
          <InputOTPSlot className="border-gray-300" index={3} />
        </InputOTPGroup>
      </InputOTP>
      <Button className="mt-4 bg-orange-800 hover:bg-orange-600 text-white font-mono text-2xl " onClick={()=>{
  router.push('/billing')
}}>Submit
</Button>
      </div>
      </>
  }
  