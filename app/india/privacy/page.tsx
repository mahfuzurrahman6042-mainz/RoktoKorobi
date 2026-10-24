import type { Metadata } from "next";
import PolicyPage from "../../../components/policy-page";

export const metadata: Metadata = { title: "India Privacy Policy" };

export default function IndiaPrivacy() { return <PolicyPage country="India" kind="Privacy Policy" />; }
