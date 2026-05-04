import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("our-agents", "routes/our-agents.tsx"),
  route("log-in", "routes/log-in.tsx"),
  route("sign-up", "routes/sign-up.tsx"),
  route("properties", "routes/properties.tsx"),
  route("properties/:id", "routes/property-item.tsx"),
  route("user-profile/:id", "routes/user-profile.tsx"),
] satisfies RouteConfig;
