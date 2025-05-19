import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export type Message = {
  error?: string;
  success?: string;
  info?: string;
  message?: string;
};

export function FormMessage({ message }: { message: Message }) {
  if (!message.error && !message.success && !message.info && !message.message) {
    return null;
  }

  const messageText = message.error || message.success || message.info || message.message;
  const isError = !!message.error;
  const isSuccess = !!message.success;
  const isInfo = !!message.info;

  let bgColor = "bg-blue-50";
  let textColor = "text-blue-700";
  let Icon = Info;
  if (isError) {
    bgColor = "bg-red-50";
    textColor = "text-red-700";
    Icon = AlertCircle;
  } else if (isSuccess) {
    bgColor = "bg-green-50";
    textColor = "text-green-700";
    Icon = CheckCircle2;
  }

  return (
    <div className={`${bgColor} ${textColor} p-3 rounded-md flex gap-2 items-start`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{messageText}</span>
    </div>
  );
}
