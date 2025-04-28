import { getUserById } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import EditUserForm from "./edit-user-form";

export const metadata: Metadata = {
  title: "Edit User",
};

const AdminEditUser = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  const user = await getUserById(id);

  if (!user) notFound();
  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <h1 className="h2-bold">Edit User</h1>
      <EditUserForm user={user} />
    </div>
  );
};

export default AdminEditUser;
