import { FullTable } from "../components/full-table";

export default async function HomePage() {
  const data = await getData();

  return (
    <div>
      <title>{data.title}</title>
      <FullTable />
    </div>
  );
}

const getData = async () => {
  return {
    title: "Can I use Node?",
  };
};

export const getConfig = async () => {
  return {
    render: "static",
  };
};
