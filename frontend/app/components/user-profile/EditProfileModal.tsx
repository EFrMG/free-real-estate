import { useState, useRef } from "react";
import { useRevalidator } from "react-router";
import { motion, AnimatePresence } from "motion/react";

import type { UserProfile } from "~/data/generalData";
import type { ProfileState } from "~/routes/user-profile";
import type { ModalProps } from "./modalTypes";
import { getAssetUrl } from "~/utils/display";

import { GoPencil, GoX } from "react-icons/go";

export default function EditProfileModal({
  editProfileProps,
  userId,
  userRole,
  profileState,
  updateProfileState,
}: {
  editProfileProps: ModalProps;
  userRole: UserProfile["role"];
  userId: UserProfile["id"];
  profileState: ProfileState;
  updateProfileState: (updates: Partial<ProfileState>) => void;
}) {
  const { isDialogOpen, dialogRef, openCloseDialog } = editProfileProps;

  const { revalidate, state: revalidateState } = useRevalidator();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleProfileChange = async (profileState: ProfileState) => {
    const formData = new FormData();

    formData.append("name", profileState.name);

    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    }

    if (userRole === "agent") {
      if (profileState.phoneNumber)
        formData.append("phoneNumber", String(profileState.phoneNumber));

      if (profileState.bio) formData.append("bio", String(profileState.bio));
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        },
      );

      if (response.ok) {
        // The backend returns the new path if we have a new picture
        const data = await response.json();

        if (data.profilePicture) {
          updateProfileState({ profilePicture: data.profilePicture });
        }

        openCloseDialog(false);

        if (revalidateState === "idle") revalidate();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();

      reader.onload = (e) =>
        updateProfileState({ profilePicture: e.target?.result as string });
      reader.onerror = (err) =>
        console.error(`Error while handling profile picture update: ${err}`);

      reader.readAsDataURL(file);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        openCloseDialog(false);
      }}
      className="inset-0 w-full h-full max-w-none max-h-none
      backdrop:bg-transparent bg-transparent 
      overflow-hidden border-none outline-none"
    >
      <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="flex items-center justify-center w-full h-full relative"
          >
            {/* Custom backdrop */}
            <div
              className="absolute inset-0 bg-black/46 backdrop-blur-[1px]"
              onClick={() => openCloseDialog(false)}
            />

            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              exit={{ scale: 0.99, transition: { duration: 0.15 } }}
              className="relative z-10"
            >
              <div
                className="profile-modal-card"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => openCloseDialog(false)}
                  className="profile-modal-cross"
                >
                  <GoX size={20} className="text-amber-800" />
                </button>

                <h2 className="profile-modal-title">Edit Profile</h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleProfileChange(profileState);
                  }}
                  className="space-y-4 mt-4"
                >
                  {/* Picture preview + upload */}
                  <fieldset className="flex flex-col items-center gap-3">
                    <div className="relative group">
                      <div className="overflow-hidden rounded-full">
                        <img
                          src={getAssetUrl(profileState.profilePicture)}
                          alt="Profile picture preview"
                          onClick={() => fileRef.current?.click()}
                          className="profile-picture-big cursor-pointer
                        group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute bottom-0 right-0 profile-pencil-btn"
                      >
                        <GoPencil size={14} />
                      </button>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      name="profilePicture"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />

                    <p className="text-xs text-amber-700/92">
                      Click the pencil to upload a new photo
                    </p>
                  </fieldset>

                  {/* Name input */}
                  <fieldset className="stack-0 gen-form-labels">
                    <label htmlFor="edit-name">Display Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      value={profileState.name}
                      onChange={(e) =>
                        updateProfileState({ name: e.target.value })
                      }
                      className="gen-input-forms"
                    />
                  </fieldset>

                  {userRole === "agent" && (
                    <>
                      <fieldset className="stack-0 gen-form-labels">
                        <label htmlFor="edit-phone-number">Phone Number:</label>
                        <input
                          id="edit-phone-number"
                          type="tel"
                          value={String(profileState.phoneNumber ?? "")}
                          onChange={(e) =>
                            updateProfileState({ phoneNumber: e.target.value })
                          }
                          className="gen-input-forms"
                        />
                      </fieldset>

                      <fieldset className="stack-0 gen-form-labels">
                        <label htmlFor="edit-biography">Biography</label>
                        <textarea
                          id="edit-biography"
                          value={String(profileState.bio ?? "")}
                          onChange={(e) =>
                            updateProfileState({ bio: e.target.value })
                          }
                          className="gen-input-forms max-h-[8lh]"
                        />
                      </fieldset>
                    </>
                  )}

                  <fieldset className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => openCloseDialog(false)}
                      className="profile-modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="profile-modal-accept-btn">
                      Save Changes
                    </button>
                  </fieldset>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
