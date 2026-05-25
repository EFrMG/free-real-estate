import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

import type { UserData } from "~/data/generalData";
import type { ModalProps } from "./modalTypes";

import { GoPencil, GoX } from "react-icons/go";

export default function EditProfileModal({
  user,
  editProfileProps,
}: {
  user: UserData;
  editProfileProps: ModalProps;
}) {
  const { isDialogOpen, dialogRef, openCloseDialog } = editProfileProps;

  const [name, setName] = useState(user.name);
  const [previewSrc, setPreviewSrc] = useState(user.profilePicture);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (ev) => setPreviewSrc(ev.target?.result as string);
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

                <h2 className="text-xl font-semibold text-amber-950">
                  Edit Profile
                </h2>

                {/* Picture preview + upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <div className="overflow-hidden rounded-full">
                      <img
                        src={previewSrc}
                        alt="Profile picture preview"
                        onClick={() => fileRef.current?.click()}
                        className="profile-picture-big cursor-pointer
                        group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-0 right-0 profile-pencil-btn"
                    >
                      <GoPencil size={14} />
                    </button>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />

                  <p className="text-xs text-amber-700/92">
                    Click the pencil to upload a new photo
                  </p>
                </div>

                {/* Name input */}
                <fieldset className="stack-0 gen-form-labels">
                  <label htmlFor="edit-name">Display Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="gen-input-forms"
                  />
                </fieldset>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => openCloseDialog(false)}
                    className="px-4 py-2 text-amber-800 rounded-md
            hover:bg-amber-200/68  transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => openCloseDialog(false)}
                    className="px-5 py-2 bg-amber-600/94 text-white font-medium
            rounded-md shadow-md hover:bg-amber-700/94
            transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
