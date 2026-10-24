import type { Metadata } from "next";
import PolicyPage from "../../../components/policy-page";

export const metadata: Metadata = { title: "Pakistan Privacy Policy" };

export default function PakistanPrivacy() { return <PolicyPage country="Pakistan" kind="Privacy Policy" />; }
