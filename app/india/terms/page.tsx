import type { Metadata } from "next";
import PolicyPage from "../../../components/policy-page";

export const metadata: Metadata = { title: "India Terms and Conditions" };

export default function IndiaTerms() { return <PolicyPage country="India" kind="Terms and Conditions" />; }
