import Yup from "yup";

export let addProductValidationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .trim()
    .max(55, "Name must be at max 55 characters."),
  brand: Yup.string().trim().max(55, "Brand must be at max 55 characters."),
  price: Yup.number()
    .min(0, "Price must be at least 0.")
    .required("Price is required."),
  quantity: Yup.number()
    .min(1, "Quantity must be at least 1.")
    .required("Quantity is required."),
  category: Yup.string()
    .required("Category is required.")
    .trim()
    .oneOf([
      "Treadmill",
      "Cross-Trainer",
      "Home-Gym",
      "Cycle",
      "Dumbbell",
      "Other",
    ]),
  freeShipping: Yup.boolean().default(false),
  description: Yup.string()
    .required("Description is required.")
    .trim()
    .min(0, "Description must be at least 500 characters.")
    .max(1000, "Description must be at max 1000 characters."),
  image: Yup.string().trim().nullable(),
});
