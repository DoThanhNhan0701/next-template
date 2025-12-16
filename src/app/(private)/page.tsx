import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-primary p-4 rounded-xl flex flex-col gap-4">
          <p className="text-primary">Do Thanh Nhan</p>
          <Button className="bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground">
            Click me
          </Button>
          <Input />
        </div>
      </div>
    </>
  );
}
