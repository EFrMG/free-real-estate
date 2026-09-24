import type { PropertyData } from "@free-real-estate/shared";
import type { ModalProps } from "./modalTypes";

import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { motion, AnimatePresence } from "motion/react";

import useObjectState from "~/hooks/useObjectState";
import getAssetUrl from "~/utils/getAssetUrl";

import { GoImage, GoPlus, GoTrash, GoX } from "react-icons/go";

// Every field is held as a string because that is what the inputs produce; the backend coerces the numeric ones and rejects whatever does not fit the schema
interface PropertyForm {
  transactionType: PropertyData["transactionType"];
  status: PropertyData["status"];
  propertyType: PropertyData["propertyType"];
  title: string;
  description: string;
  longDescription: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  province: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  sizes: string;
  // Distances are kept bare here; the "m" suffix the API wants is added on submit
  nearbyPlaces: { place: string; distance: string }[];
  interiorGallery: string[];
  exteriorImage: string;
}

interface PendingImage {
  file: File;
  preview: string;
}

const EMPTY_FORM: PropertyForm = {
  transactionType: "buy",
  status: "free",
  propertyType: "apartment",
  title: "",
  description: "",
  longDescription: "",
  price: "",
  bedrooms: "1",
  bathrooms: "1",
  province: "",
  city: "",
  address: "",
  latitude: "",
  longitude: "",
  sizes: "",
  nearbyPlaces: [],
  interiorGallery: [],
  exteriorImage: "",
};

/** Spreads a stored listing back over the form's string fields. */
function toFormState(property: PropertyData | null): PropertyForm {
  if (!property) return EMPTY_FORM;

  return {
    transactionType: property.transactionType,
    status: property.status,
    propertyType: property.propertyType,
    title: property.title,
    description: property.description,
    longDescription: property.longDescription ?? "",
    price: String(property.price),
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    province: property.province,
    city: property.city,
    address: property.address,
    latitude: String(property.latitude),
    longitude: String(property.longitude),
    sizes: (property.sizes ?? []).join(", "),
    nearbyPlaces: Object.entries(property.nearbyPlaces ?? {}).map(
      ([place, distance]) => ({ place, distance: distance.replace(/m$/, "") }),
    ),
    interiorGallery: property.interiorGallery ?? [],
    exteriorImage: property.exteriorImage,
  };
}

export default function PropertyFormModal({
  propertyFormProps,
  property,
}: {
  propertyFormProps: ModalProps;
  /** The listing being edited, or null to create a new one. */
  property: PropertyData | null;
}) {
  const { isDialogOpen, dialogRef, openCloseDialog } = propertyFormProps;

  const fetcher = useFetcher<{ success?: boolean; error?: string }>();

  const exteriorInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const { state: form, updateState: updateForm } =
    useObjectState<PropertyForm>(EMPTY_FORM);

  // File inputs can't be driven from state, so the picked files are held here and submitted through a FormData built by hand rather than by the form element
  const [exteriorImage, setExteriorImage] = useState<PendingImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<PendingImage[]>([]);

  const [formError, setFormError] = useState<string | null>(null);

  // Which listing the fields currently hold, or null while the dialog is closed
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const isEditing = Boolean(property);

  // Every opening starts from the stored listing, so a cancelled edit leaves nothing behind. Adjusting during render rather than in an effect is what keeps a frame of the previously edited listing from painting first
  const openKey = isDialogOpen ? String(property?.id ?? "new") : null;

  if (openKey !== loadedKey) {
    setLoadedKey(openKey);

    // Closing leaves the fields alone so they stay filled through the exit animation; the previews of the last opening are only freed here, once nothing can be showing them any more
    if (openKey) {
      if (exteriorImage) URL.revokeObjectURL(exteriorImage.preview);

      for (const image of galleryImages) URL.revokeObjectURL(image.preview);

      updateForm(toFormState(property));
      setExteriorImage(null);
      setGalleryImages([]);
      setFormError(null);
    }
  }

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      openCloseDialog(false);
    }
  }, [fetcher.state, fetcher.data]);

  const handleCloseDialog = (e: React.SyntheticEvent) => {
    e.preventDefault();

    openCloseDialog(false);
  };

  const handleExteriorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (exteriorImage) URL.revokeObjectURL(exteriorImage.preview);

    setExteriorImage({ file, preview: URL.createObjectURL(file) });
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (!files.length) return;

    setGalleryImages((current) => [
      ...current,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);

    // Let the same file be picked again after it has been removed from the list
    e.target.value = "";
  };

  const removeStoredGalleryImage = (path: string) => {
    updateForm({
      interiorGallery: form.interiorGallery.filter((image) => image !== path),
    });
  };

  const removePendingGalleryImage = (preview: string) => {
    URL.revokeObjectURL(preview);

    setGalleryImages((current) =>
      current.filter((image) => image.preview !== preview),
    );
  };

  const updateNearbyPlace = (
    index: number,
    updates: Partial<{ place: string; distance: string }>,
  ) => {
    updateForm({
      nearbyPlaces: form.nearbyPlaces.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...updates } : row,
      ),
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!exteriorImage && !form.exteriorImage) {
      setFormError("Please, upload an exterior image for the listing.");

      return;
    }

    const sizes = form.sizes
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean)
      .map(Number);

    if (sizes.some((size) => !Number.isFinite(size) || size <= 0)) {
      setFormError("Room sizes must be a comma-separated list of numbers.");

      return;
    }

    if (form.interiorGallery.length + galleryImages.length > 12) {
      setFormError("A listing can hold at most 12 interior images.");

      return;
    }

    const nearbyRows = form.nearbyPlaces.filter(
      (row) => row.place.trim() !== "",
    );

    if (nearbyRows.some((row) => !/^\d+$/.test(row.distance.trim()))) {
      setFormError("Every nearby place needs a distance in whole metres.");

      return;
    }

    setFormError(null);

    const payload = new FormData();

    payload.set("intent", isEditing ? "property-update" : "property-create");

    if (property) payload.set("propertyId", String(property.id));

    // Plain fields go over as-is; the backend coerces and validates them
    for (const field of [
      "transactionType",
      "status",
      "propertyType",
      "title",
      "description",
      "price",
      "bedrooms",
      "bathrooms",
      "province",
      "city",
      "address",
      "latitude",
      "longitude",
    ] as const) {
      payload.set(field, form[field]);
    }

    // The API ignores empty text fields so a partial edit doesn't blank them, with the long description as the one field it lets you clear on purpose
    payload.set("longDescription", form.longDescription.trim());

    payload.set("exteriorImage", form.exteriorImage);
    payload.set("sizes", JSON.stringify(sizes));
    payload.set("interiorGallery", JSON.stringify(form.interiorGallery));
    payload.set(
      "nearbyPlaces",
      JSON.stringify(
        Object.fromEntries(
          nearbyRows.map((row) => [
            row.place.trim(),
            `${row.distance.trim()}m`,
          ]),
        ),
      ),
    );

    if (exteriorImage) payload.set("exteriorFile", exteriorImage.file);

    for (const image of galleryImages) {
      payload.append("galleryFiles", image.file);
    }

    fetcher.submit(payload, {
      method: "POST",
      encType: "multipart/form-data",
    });
  };

  const exteriorPreview = exteriorImage?.preview || form.exteriorImage;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCloseDialog}
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
              className="absolute inset-0 bg-black/48 backdrop-blur-[1px]"
              onClick={handleCloseDialog}
            />

            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              exit={{ scale: 0.99, transition: { duration: 0.15 } }}
              className="relative z-10"
            >
              <div
                className="modal-card-wide custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={handleCloseDialog} className="modal-cross">
                  <GoX size={20} className="text-amber-800" />
                </button>

                <h2 className="modal-title">
                  {isEditing ? "Edit Listing" : "New Listing"}
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="stack-4 mt-4 form-label"
                >
                  {formError || fetcher.data?.error ? (
                    <p className="form-error">
                      {formError ?? fetcher.data?.error}
                    </p>
                  ) : (
                    <div className="form-message-space" />
                  )}

                  {/* Exterior image */}
                  <fieldset className="stack-2">
                    <label htmlFor="property-exterior">Exterior Image</label>

                    <button
                      type="button"
                      id="property-exterior"
                      onClick={() => exteriorInputRef.current?.click()}
                      className="relative block w-full h-40 p-1 rounded-lg overflow-hidden
                      border-2 border-dashed border-amber-300/74 bg-amber-100/28
                      hover:border-amber-500/74 transition-colors duration-150"
                    >
                      {exteriorPreview ? (
                        <img
                          src={getAssetUrl(exteriorPreview)}
                          alt="Exterior preview"
                          draggable={false}
                          className="w-full h-full rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex flex-col items-center justify-center gap-2 h-full text-amber-700/84">
                          <GoImage size={28} />
                          <span className="text-sm">
                            Click to upload the main photo
                          </span>
                        </span>
                      )}
                    </button>

                    <input
                      ref={exteriorInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleExteriorChange}
                      className="sr-only"
                    />
                  </fieldset>

                  {/* Interior gallery */}
                  <fieldset className="stack-2">
                    <label htmlFor="property-gallery">Interior Gallery</label>

                    <div className="flex flex-wrap gap-2">
                      {form.interiorGallery.map((image) => (
                        <GalleryThumbnail
                          key={image}
                          src={getAssetUrl(image)}
                          onRemove={() => removeStoredGalleryImage(image)}
                        />
                      ))}

                      {galleryImages.map((image) => (
                        <GalleryThumbnail
                          key={image.preview}
                          src={image.preview}
                          onRemove={() =>
                            removePendingGalleryImage(image.preview)
                          }
                        />
                      ))}

                      <button
                        type="button"
                        id="property-gallery"
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex items-center justify-center w-20 h-20 rounded-md
                        border-2 border-dashed border-amber-300/74 text-amber-700/84
                        hover:border-amber-500/74 hover:text-amber-800 transition-colors duration-150"
                        title="Add interior photos"
                      >
                        <GoPlus size={22} />
                      </button>
                    </div>

                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleGalleryChange}
                      className="sr-only"
                    />
                  </fieldset>

                  {/* Headline */}
                  <fieldset className="stack-0">
                    <label htmlFor="property-title">Title</label>
                    <input
                      id="property-title"
                      type="text"
                      className="input-form"
                      maxLength={120}
                      value={form.title}
                      onChange={(e) => updateForm({ title: e.target.value })}
                      required
                    />
                  </fieldset>

                  <fieldset className="stack-0">
                    <label htmlFor="property-description">
                      Short Description
                    </label>
                    <textarea
                      id="property-description"
                      rows={2}
                      className="input-form"
                      maxLength={600}
                      value={form.description}
                      onChange={(e) =>
                        updateForm({ description: e.target.value })
                      }
                      required
                    />
                  </fieldset>

                  <fieldset className="stack-0">
                    <label htmlFor="property-long-description">
                      Full Description
                    </label>
                    <textarea
                      id="property-long-description"
                      rows={4}
                      className="input-form max-h-[12lh]"
                      maxLength={4000}
                      value={form.longDescription}
                      onChange={(e) =>
                        updateForm({ longDescription: e.target.value })
                      }
                    />
                  </fieldset>

                  {/* Classification */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <fieldset className="stack-0">
                      <label htmlFor="property-transaction">Transaction</label>
                      <select
                        id="property-transaction"
                        className="input-form capitalize"
                        value={form.transactionType}
                        onChange={(e) =>
                          updateForm({
                            transactionType: e.target
                              .value as PropertyForm["transactionType"],
                          })
                        }
                      >
                        <option value="buy">Buy</option>
                        <option value="rent">Rent</option>
                      </select>
                    </fieldset>

                    <fieldset className="stack-0">
                      <label htmlFor="property-type">Property</label>
                      <select
                        id="property-type"
                        className="input-form capitalize"
                        value={form.propertyType}
                        onChange={(e) =>
                          updateForm({
                            propertyType: e.target
                              .value as PropertyForm["propertyType"],
                          })
                        }
                      >
                        <option value="apartment">Apartment</option>
                        <option value="house">House</option>
                        <option value="condominium">Condominium</option>
                      </select>
                    </fieldset>

                    <fieldset className="stack-0">
                      <label htmlFor="property-status">Status</label>
                      <select
                        id="property-status"
                        className="input-form capitalize"
                        value={form.status}
                        onChange={(e) =>
                          updateForm({
                            status: e.target.value as PropertyForm["status"],
                          })
                        }
                      >
                        <option value="free">Free</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </fieldset>
                  </div>

                  {/* Figures */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <fieldset className="stack-0">
                      <label htmlFor="property-price">Price ($)</label>
                      <input
                        id="property-price"
                        type="number"
                        className="input-form"
                        min={0}
                        step={1}
                        value={form.price}
                        onChange={(e) => updateForm({ price: e.target.value })}
                        required
                      />
                    </fieldset>

                    <fieldset className="stack-0">
                      <label htmlFor="property-bedrooms">Bedrooms</label>
                      <input
                        id="property-bedrooms"
                        type="number"
                        className="input-form"
                        min={0}
                        max={50}
                        step={1}
                        value={form.bedrooms}
                        onChange={(e) =>
                          updateForm({ bedrooms: e.target.value })
                        }
                        required
                      />
                    </fieldset>

                    <fieldset className="stack-0">
                      <label htmlFor="property-bathrooms">Bathrooms</label>
                      <input
                        id="property-bathrooms"
                        type="number"
                        className="input-form"
                        min={0}
                        max={50}
                        step={1}
                        value={form.bathrooms}
                        onChange={(e) =>
                          updateForm({ bathrooms: e.target.value })
                        }
                        required
                      />
                    </fieldset>
                  </div>

                  {/* Location */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <fieldset className="stack-0">
                      <label htmlFor="property-province">Province</label>
                      <input
                        id="property-province"
                        type="text"
                        className="input-form"
                        maxLength={80}
                        value={form.province}
                        onChange={(e) =>
                          updateForm({ province: e.target.value })
                        }
                        required
                      />
                    </fieldset>

                    <fieldset className="stack-0">
                      <label htmlFor="property-city">City</label>
                      <input
                        id="property-city"
                        type="text"
                        className="input-form"
                        maxLength={80}
                        value={form.city}
                        onChange={(e) => updateForm({ city: e.target.value })}
                        required
                      />
                    </fieldset>
                  </div>

                  <fieldset className="stack-0">
                    <label htmlFor="property-address">Address</label>
                    <input
                      id="property-address"
                      type="text"
                      className="input-form"
                      maxLength={160}
                      value={form.address}
                      onChange={(e) => updateForm({ address: e.target.value })}
                      required
                    />
                  </fieldset>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <fieldset className="stack-0">
                      <label htmlFor="property-latitude">Latitude</label>
                      <input
                        id="property-latitude"
                        type="number"
                        className="input-form"
                        min={-90}
                        max={90}
                        step="any"
                        value={form.latitude}
                        onChange={(e) =>
                          updateForm({ latitude: e.target.value })
                        }
                        required
                      />
                    </fieldset>

                    <fieldset className="stack-0">
                      <label htmlFor="property-longitude">Longitude</label>
                      <input
                        id="property-longitude"
                        type="number"
                        className="input-form"
                        min={-180}
                        max={180}
                        step="any"
                        value={form.longitude}
                        onChange={(e) =>
                          updateForm({ longitude: e.target.value })
                        }
                        required
                      />
                    </fieldset>
                  </div>

                  {/* Extras */}
                  <fieldset className="stack-0">
                    <label htmlFor="property-sizes">
                      Room Sizes (sqft, comma separated)
                    </label>
                    <input
                      id="property-sizes"
                      type="text"
                      className="input-form"
                      placeholder="80, 20"
                      value={form.sizes}
                      onChange={(e) => updateForm({ sizes: e.target.value })}
                    />
                  </fieldset>

                  <fieldset className="stack-2">
                    <label htmlFor="property-nearby-add">Nearby Places</label>

                    {form.nearbyPlaces.map((row, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          aria-label="Place"
                          className="input-form grow"
                          placeholder="school"
                          maxLength={48}
                          value={row.place}
                          onChange={(e) =>
                            updateNearbyPlace(index, { place: e.target.value })
                          }
                        />
                        <div className="relative w-32 shrink-0">
                          <input
                            type="number"
                            aria-label="Distance in metres"
                            className="input-form w-full pr-8"
                            placeholder="400"
                            min={0}
                            step={1}
                            value={row.distance}
                            onChange={(e) =>
                              updateNearbyPlace(index, {
                                distance: e.target.value,
                              })
                            }
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700/84">
                            m
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateForm({
                              nearbyPlaces: form.nearbyPlaces.filter(
                                (_, rowIndex) => rowIndex !== index,
                              ),
                            })
                          }
                          className="p-2 text-amber-700/84 hover:text-rose-700 transition-colors duration-150"
                          title="Remove this place"
                        >
                          <GoTrash size={18} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      id="property-nearby-add"
                      onClick={() =>
                        updateForm({
                          nearbyPlaces: [
                            ...form.nearbyPlaces,
                            { place: "", distance: "" },
                          ],
                        })
                      }
                      className="flex items-center gap-[1ch] w-fit mx-auto my-4 px-3 py-1.5 text-sm
                      text-amber-800 bg-amber-200/36 rounded-sm shadow-sm
                      gen-btn-border btn-hovaction-xs"
                    >
                      <GoPlus size={16} /> Add a place
                    </button>
                  </fieldset>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseDialog}
                      className="modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="modal-accept-btn disabled:opacity-74"
                      disabled={fetcher.state !== "idle"}
                    >
                      {fetcher.state !== "idle"
                        ? "Saving..."
                        : isEditing
                          ? "Save Changes"
                          : "Create Listing"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

function GalleryThumbnail({
  src,
  onRemove,
}: {
  src: string;
  onRemove: () => void;
}) {
  return (
    <div className="relative w-20 h-20">
      <img
        src={src}
        alt="Interior preview"
        draggable={false}
        className="w-full h-full object-cover rounded-md border border-amber-200/64"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 p-1 rounded-full
        bg-amber-800/84 text-amber-50 hover:bg-rose-600/84 transition-colors duration-150"
        title="Remove this image"
      >
        <GoX size={12} />
      </button>
    </div>
  );
}
