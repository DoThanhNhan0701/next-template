import { Spinner } from "@/components/ui/spinner";
import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  classNameSpinner?: string;
}

export default function Loading({
  className,
  classNameSpinner,
}: Readonly<Props>) {
  return (
    <div className={className}>
      <Spinner className={twMerge("size-6", classNameSpinner)} />
    </div>
  );
}
