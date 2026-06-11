import type { UserProfile } from "~/data/generalData";
import type { ProfileState } from "~/routes/user-profile";
import type { ModalProps } from "./modalTypes";

import { useRef, useEffect } from "react";
import { useFetcher } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { getAssetUrl } from "~/utils/display";
import { createDialogCloseHandler } from "~/utils/dialogs";

import { GoPencil, GoX } from "react-icons/go";

export default function EditProfileModal({
  editProfileProps,
  user,
  profileState,
  updateProfileState,
}: {
  editProfileProps: ModalProps;
  user: UserProfile;
  profileState: ProfileState;
  updateProfileState: (updates: Partial<ProfileState>) => void;
}) {
  const { isDialogOpen, dialogRef, openCloseDialog } = editProfileProps;

  const fetcher = useFetcher();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.error) {
      if (fetcher.data.profilePicture) {
        updateProfileState({ profilePicture: fetcher.data.profilePicture });
      }

      openCloseDialog(false);
    }
  }, [fetcher.state, fetcher.data]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) =>
        updateProfileState({ profilePicture: e.target?.result as string });
      reader.onerror = (err) =>
        console.error(`Error while handling profile picture update: ${err}`);

      reader.readAsDataURL(file);
    }
  };

  const handleCloseDialog = createDialogCloseHandler<ProfileState>(
    openCloseDialog,
    updateProfileState,
    {
      name: user.name,
      profilePicture: user.profilePicture,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
    },
  );

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        handleCloseDialog(e);
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
              onClick={(e) => handleCloseDialog(e)}
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
                  onClick={(e) => handleCloseDialog(e)}
                  className="profile-modal-cross"
                >
                  <GoX size={20} className="text-amber-800" />
                </button>

                <h2 className="profile-modal-title">Edit Profile</h2>

                <fetcher.Form
                  method="PUT"
                  encType="multipart/form-data"
                  className="space-y-4 mt-4"
                >
                  <input type="hidden" name="intent" value="profile-change" />

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
                      name="name"
                      value={profileState.name}
                      onChange={(e) =>
                        updateProfileState({ name: e.target.value })
                      }
                      className="gen-input-forms"
                    />
                  </fieldset>

                  {user.role === "agent" && (
                    <>
                      <fieldset className="stack-0 gen-form-labels">
                        <label htmlFor="edit-phone-number">Phone Number:</label>
                        <input
                          id="edit-phone-number"
                          type="tel"
                          name="phoneNumber"
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
                          name="bio"
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
                      onClick={(e) => handleCloseDialog(e)}
                      className="profile-modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="profile-modal-accept-btn">
                      Save Changes
                    </button>
                  </fieldset>
                </fetcher.Form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
