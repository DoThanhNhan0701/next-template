import { Button } from "@/components/ui/button";
import { logoutAction } from "../authentication/Login/logout.action";
import SearchLocation from "./_component/SearchLocation";

interface Location {
  name: string;
  address: string;
  code: string;
  gps_latitude: number;
  gps_longitude: number;
  id: string;
  created_at: string;
}

export default function HomePage({ locations }: { locations: Location[] }) {
  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-(--surface-border-color) p-4 rounded-xl flex flex-col gap-4">
          <Button variant="outline" onClick={logoutAction}>
            Logout
          </Button>
          <Button variant="destructive">Loading</Button>
          <Button variant="destructive">Click me</Button>
          <SearchLocation />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 mt-4 overflow-y-auto h-[300px]">
        {locations?.map((location) => (
          <div
            className="border border-(--surface-border-color) p-4 rounded-xl"
            key={location.id}
          >
            {location.name}
          </div>
        ))}
      </div>
    </>
  );
}
