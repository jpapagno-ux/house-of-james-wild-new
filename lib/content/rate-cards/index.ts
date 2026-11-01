import more from "./more.json";
import { cardFor as cardForData, yearFor as yearForData, type CardData } from "@/lib/rate-card";

// MORE Collection's published rates (more.co.za/rates), bound for the site.
export const MORE = more as unknown as CardData;
export const cardFor = (pageKey: string) => cardForData(MORE, pageKey);
export const yearFor = (property: string, checkIn: string, checkOut: string) => yearForData(MORE, property, checkIn, checkOut);
