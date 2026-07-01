import imgCheckMark from "./c1d43ca9effa358b86bb9839fa5a6f497d4eebcd.png";

function Frame() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[7px] p-[10px] top-[394px] w-[376px]">
      <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-white w-[343px]">
        <p className="leading-[100.0949935913086%]">OTP has been sent successfully!</p>
      </div>
    </div>
  );
}

export default function OtpRsendPage() {
  return (
    <div className="bg-[#0c1222] relative size-full" data-name="OTP rsend page">
      <Frame />
      <div className="absolute left-[150px] size-[90px] top-[304px]" data-name="Check Mark">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgCheckMark} />
      </div>
    </div>
  );
}