import { useCallback, useEffect, useState } from "react";
import { isValidIndianMobileNumber, normalizeFrontendMobileNumber } from "./utils";

const CHECKOUT_PHONE_KEY = "texs_checkout_customer_phone";
const CHECKOUT_PHONE_EVENT = "texs_checkout_phone_changed";

function emitPhoneChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHECKOUT_PHONE_EVENT));
  }
}

/**
 * Retrieves the preserved customer checkout phone number from storage.
 */
export function getCheckoutPhone(): string {
  if (typeof window === "undefined") return "";
  try {
    const sessionVal = sessionStorage.getItem(CHECKOUT_PHONE_KEY);
    if (sessionVal) return sessionVal;
    const localVal = localStorage.getItem(CHECKOUT_PHONE_KEY);
    return localVal || "";
  } catch {
    return "";
  }
}

/**
 * Preserves the customer's phone number for checkout in session/local storage.
 */
export function setCheckoutPhone(phone: string): void {
  if (typeof window === "undefined") return;
  try {
    const normalized = normalizeFrontendMobileNumber(phone);
    sessionStorage.setItem(CHECKOUT_PHONE_KEY, normalized);
    localStorage.setItem(CHECKOUT_PHONE_KEY, normalized);
    emitPhoneChange();
  } catch {
    // Ignore storage availability errors
  }
}

/**
 * Clears preserved customer phone number upon order completion or reset.
 */
export function clearCheckoutPhone(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CHECKOUT_PHONE_KEY);
    localStorage.removeItem(CHECKOUT_PHONE_KEY);
    emitPhoneChange();
  } catch {
    // Ignore storage availability errors
  }
}

/**
 * React hook to access and update the preserved customer checkout phone number.
 */
export function useCheckoutPhone() {
  const [phone, setPhoneState] = useState<string>(() => getCheckoutPhone());

  useEffect(() => {
    const refresh = () => setPhoneState(getCheckoutPhone());
    window.addEventListener(CHECKOUT_PHONE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHECKOUT_PHONE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const save = useCallback((newPhone: string) => {
    setCheckoutPhone(newPhone);
  }, []);

  const clear = useCallback(() => {
    clearCheckoutPhone();
  }, []);

  return {
    phone,
    isValid: isValidIndianMobileNumber(phone),
    setPhone: save,
    clearPhone: clear,
  };
}
