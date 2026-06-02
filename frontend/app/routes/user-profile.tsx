import type { Route } from "./+types/user-profile";
import { Link, redirect, type ActionFunctionArgs } from "react-router";

import type {
  PropertyData,
  UserProfile as UserProfileData,
} from "~/data/generalData";

import useDialog from "~/hooks/useDialog";
import useObjectState from "~/hooks/useObjectState";
import { getAssetUrl } from "~/utils/display";

import EditProfileModal from "~/components/user-profile/EditProfileModal";
import ChangePasswordModal from "~/components/user-profile/ChangePasswordModal";
import MiniPropertyCard from "~/components/user-profile/MiniPropertyCard";

import {
  GoBookmark,
  GoComment,
  GoPencil,
  GoShieldLock,
  GoPackage,
} from "react-icons/go";

export interface ProfileState extends Omit<
  UserProfileData,
  "id" | "email" | "role" | "licenseNumber"
> {}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Profile | Free Real Estate" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");

  const userRes = await fetch("http://localhost:3000/api/auth/me", {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });

  if (!userRes) return redirect("/log-in");

  const user: UserProfileData = await userRes.json();
  const userId = user.id;

  const [userPropertiesRes, userBookmarksRes] = await Promise.all([
    fetch(`http://localhost:3000/api/users/${userId}/properties`),
    fetch(`http://localhost:3000/api/users/${userId}/bookmarks`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    }),
  ]);

  if (!userPropertiesRes.ok || !userBookmarksRes.ok) {
    throw new Response("Failed to fetch user properties and/or bookmarks", {
      status: 500,
    });
  }

  const userProperties = await userPropertiesRes.json();
  const userBookmarks = await userBookmarksRes.json();

  // TODO: messaging feature
  const userMessages = null;

  return { user, userProperties, userBookmarks, userMessages };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const data = await request.formData();
  const intent = data.get("intent");

  if (intent === "password-change") {
    const currentPassword = data.get("currentPassword") as string;
    const newPassword = data.get("newPassword") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    if (newPassword !== confirmPassword)
      return { error: "New passwords must match!" };

    const response = await fetch(
      `http://localhost:3000/api/users/${params.id}/password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") ?? "",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok)
      return {
        error:
          result.error || "Failed to update your password. Please, try again.",
      };

    return { success: true };
  }

  if (intent === "profile-change") {
    const profilePicture = data.get("profilePicture");
    if (profilePicture instanceof File && profilePicture.size === 0) {
      data.delete("profilePicture");
    }

    const response = await fetch(
      `http://localhost:3000/api/users/${params.id}`,
      {
        headers: {
          Cookie: request.headers.get("Cookie") ?? "",
        },
        method: "PUT",
        body: data,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        error:
          result.error || "Failed to update your profile. Please, try again.",
      };
    }

    return result;
  }
}

function ProfileSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="p-4 bg-amber-100/48 rounded-xl shadow-md border border-amber-200/36">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-amber-700">{icon}</span>
        <h2 className="text-lg font-semibold text-amber-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function UserProfile({ loaderData }: Route.ComponentProps) {
  const { user, userProperties, userBookmarks, userMessages } = loaderData;

  const { state: profileState, updateState: updateProfileState } =
    useObjectState<ProfileState>({
      name: user.name,
      profilePicture: user.profilePicture,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
    });

  const {
    isDialogOpen: isEditProfileOpen,
    dialogRef: editProfileRef,
    openCloseDialog: setEditProfileOpen,
  } = useDialog();

  const {
    isDialogOpen: isChangePasswordOpen,
    dialogRef: changePasswordRef,
    openCloseDialog: setChangePasswordOpen,
  } = useDialog();

  return (
    <>
      <main className="gen-main">
        {/* Left column */}
        <div className="gen-left-column">
          {/* Profile header */}
          <section
            className="relative overflow-hidden rounded-xl shadow-lg
            bg-linear-to-br from-amber-100/82 via-amber-50 to-amber-100/36
            border border-amber-200/48"
          >
            <div
              className="absolute top-0 inset-x-0 h-24
              bg-linear-to-r from-amber-400/36 via-amber-300/28 to-amber-500/26"
            />

            <div className="relative z-10 p-5 sm:p-6">
              {/* Avatar + Info row */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div>
                  <img
                    src={getAssetUrl(user.profilePicture)}
                    alt={`${user.name}-profile-picture`}
                    draggable={false}
                    className="profile-picture-big"
                  />
                </div>

                <div className="text-center sm:text-left mt-2 sm:mt-4 stack-2 grow">
                  <h1 className="text-2xl font-bold text-amber-950 tracking-tight">
                    {user.name}
                  </h1>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="flex items-center gap-4 text-sm text-amber-800/84">
                        {user.email}
                        {user.role === "user" && (
                          //  TODO: agent promotion
                          <button className="text-amber-900/58">
                            become an agent
                          </button>
                        )}
                      </p>
                      <p
                        className="w-fit mt-1 px-3 py-0.5 text-xs 
                    bg-amber-300/30 text-amber-900 font-medium
                    rounded-full border border-amber-300/50 capitalize
                    mx-auto sm:mx-0"
                      >
                        {user.role}
                      </p>{" "}
                    </div>

                    <button
                      onClick={() => setEditProfileOpen(true)}
                      className="profile-pencil-btn"
                      title={
                        user.role === "agent"
                          ? "Edit Name, Profile Picture, Telephone Number & Biography"
                          : "Edit Name & Profile Picture"
                      }
                    >
                      <GoPencil size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Password section */}
              <div
                className="mt-6 py-4 pl-4 pr-6 rounded-md bg-amber-50 border border-amber-200/64
                flex items-center justify-between flex-wrap gap-3"
              >
                <div className="stack-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-amber-900 leading-none">
                    <GoShieldLock
                      size={20}
                      className="text-amber-600 shrink-0"
                    />
                    Password
                  </p>
                  <p
                    className="ml-4 text-lg tracking-[0.3em] text-amber-800/64 select-none"
                    aria-label="Password hidden"
                  >
                    •••••••••
                  </p>
                </div>
                <button
                  onClick={() => setChangePasswordOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-amber-800
                  bg-amber-200/36 rounded-sm shadow-sm gen-btn-border gen-btn-hovaction-sm"
                >
                  Change Password
                </button>
              </div>

              {/* Agent details */}
              {user.role === "agent" && (
                <div
                  className="mt-6 py-4 pl-4 pr-6 rounded-md bg-amber-50/84
                  border border-amber-200/64 space-y-3
                  [&_div]:flex [&_div]:justify-between [&_div]:items-center
                  [&_div:not(:last-of-type)]:pb-3 [&_div:not(:last-of-type)]:border-b [&_div]:border-amber-200/64
                  [&_h2]:text-lg [&_h2]:text-amber-950
                  [&_p]:ml-8 [&_p]:text-slate-900/94"
                >
                  <div>
                    <h2>License number:</h2>
                    <p>{user.licenseNumber}</p>
                  </div>
                  <div>
                    <h2>Telephone number:</h2>
                    <p>{user.phoneNumber}</p>
                  </div>
                  <div>
                    <h2>Biography:</h2>
                    <p className="text-slate-900/72!">{user.bio}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <ProfileSection
            title="Bookmarked Properties"
            icon={<GoBookmark size={24} />}
          >
            {userBookmarks?.length ? (
              <div className="profile-bookmarks--properties">
                {userBookmarks.map((property: PropertyData) => (
                  <MiniPropertyCard
                    key={`bookmark-${property.id}`}
                    property={property}
                  />
                ))}
              </div>
            ) : (
              <p className="max-w-none py-4 text-sm text-amber-800/94 italic text-center">
                Your bookmarked properties will appear here.
              </p>
            )}
          </ProfileSection>

          {/* Property list */}
          {user.role === "agent" && (
            <ProfileSection
              title="My Properties"
              icon={<GoPackage size={24} />}
            >
              {userProperties?.length ? (
                <div className="profile-bookmarks--properties">
                  {userProperties.map((property: PropertyData) => (
                    <MiniPropertyCard
                      key={`property-${property.id}`}
                      property={property}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-4 text-sm text-amber-800/94 italic text-center">
                  You currently have no listed properties.
                </p>
              )}
            </ProfileSection>
          )}

          {/* TODO: blog posts section */}
        </div>

        {/* Right column */}
        <div className="md:bg-amber-100 max-md:mt-4 md:p-6">
          <div
            className="md:sticky md:top-[7.5vh] p-5
            bg-amber-100/60 md:bg-amber-50/60 rounded-xl shadow-md
            border border-amber-200/40"
          >
            <h2 className="text-lg font-semibold text-amber-950 mb-4 flex items-center gap-2">
              <span className="text-amber-700">
                <GoComment size={24} />
              </span>
              Messages
            </h2>
            <div className="stack-4 py-6 text-center">
              {!userMessages && (
                <>
                  <div className="mx-auto p-1 rounded-full bg-amber-200/48 flex items-center justify-center">
                    <span className="text-2xl opacity-42">💬</span>
                  </div>
                  <p className="text-sm text-amber-800/74 italic">
                    Your chats will appear here.
                  </p>
                  <p className="text-xs text-amber-700/92">
                    Visit{" "}
                    <Link
                      to="/our-agents"
                      className="underline decoration-amber-700/76"
                    >
                      Our Agents
                    </Link>{" "}
                    profiles to send them a message.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <EditProfileModal
        editProfileProps={{
          isDialogOpen: isEditProfileOpen,
          dialogRef: editProfileRef,
          openCloseDialog: setEditProfileOpen,
        }}
        user={user}
        profileState={profileState}
        updateProfileState={updateProfileState}
      />

      <ChangePasswordModal
        changePasswordProps={{
          isDialogOpen: isChangePasswordOpen,
          dialogRef: changePasswordRef,
          openCloseDialog: setChangePasswordOpen,
        }}
      />
    </>
  );
}
