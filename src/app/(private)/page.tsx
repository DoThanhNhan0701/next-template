import HomePage from "@/components/pages/Home";
import { endpoints } from "@/config/endpoints";
import { httpGet } from "@/lib/http.server";

interface Location {
  name: string;
  address: string;
  code: string;
  gps_latitude: number;
  gps_longitude: number;
  id: string;
  created_at: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: { name?: string };
}) {
  const name = (await searchParams).name;
  const response = await httpGet<Location[]>(endpoints.LOCATIONS, {
    params: {
      name: name ?? "",
    },
  });

  return <HomePage locations={response} />;
}
