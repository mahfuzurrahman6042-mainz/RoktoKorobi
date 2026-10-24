import type { Metadata } from "next";
import PolicyPage from "../../../components/policy-page";

export const metadata: Metadata = { title: "Pakistan Terms and Conditions" };

export default function PakistanTerms() { return <PolicyPage country="Pakistan" kind="Terms and Conditions" />; }
