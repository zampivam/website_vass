import { describe, expect, it } from "vitest";
import { normalizeChildIntake, normalizeFamilyIntake, validateIntake } from "./intake";

const familyInput = {
  caregiverFirstName: " Andrea ",
  caregiverLastName: " Parent ",
  relationship: " Parent ",
  phone: " 540-555-0100 ",
  preferredContact: "email" as const,
  addressLine1: " 1066 Hisey Ave ",
  addressLine2: " Suite 102 ",
  city: " Woodstock ",
  state: " va ",
  postalCode: " 22664 "
};

const childInput = {
  firstName: " Taylor ",
  lastName: " Family ",
  preferredName: " Tay ",
  dateOfBirth: "2018-04-12",
  school: " School Name ",
  grade: " 1 ",
  diagnosisStatus: "diagnosed" as const,
  primaryLanguage: " English ",
  requestedServices: ["aba_therapy", "caregiver_training"],
  insuranceStatus: "insured" as const,
  insuranceProvider: " Example Health ",
  memberId: " ABC123 ",
  groupNumber: " GROUP7 ",
  subscriberName: " Andrea Parent ",
  subscriberRelationship: " Parent "
};

describe("professional intake normalization", () => {
  it("trims contact and address fields and standardizes the state", () => {
    expect(normalizeFamilyIntake(familyInput)).toEqual({
      caregiverFirstName: "Andrea",
      caregiverLastName: "Parent",
      relationship: "Parent",
      phone: "540-555-0100",
      preferredContact: "email",
      addressLine1: "1066 Hisey Ave",
      addressLine2: "Suite 102",
      city: "Woodstock",
      state: "VA",
      postalCode: "22664"
    });
  });

  it("normalizes child, service, and insurance fields without adding display names to paths", () => {
    expect(normalizeChildIntake(childInput)).toEqual({
      firstName: "Taylor",
      lastName: "Family",
      preferredName: "Tay",
      dateOfBirth: "2018-04-12",
      school: "School Name",
      grade: "1",
      diagnosisStatus: "diagnosed",
      primaryLanguage: "English",
      requestedServices: ["aba_therapy", "caregiver_training"],
      insuranceStatus: "insured",
      insuranceProvider: "Example Health",
      memberId: "ABC123",
      groupNumber: "GROUP7",
      subscriberName: "Andrea Parent",
      subscriberRelationship: "Parent"
    });
  });
});

describe("intake validation", () => {
  it("requires family identity, contact, address, child identity, and date of birth", () => {
    const result = validateIntake(
      { ...familyInput, phone: "" },
      { ...childInput, firstName: "", dateOfBirth: "" }
    );
    expect(result).toEqual([
      "Caregiver phone is required.",
      "Child first name is required.",
      "Child date of birth is required."
    ]);
  });

  it("requires core insurance details only when the family selects insured", () => {
    expect(validateIntake(familyInput, { ...childInput, memberId: "" })).toContain(
      "Insurance member ID is required."
    );
    expect(
      validateIntake(familyInput, {
        ...childInput,
        insuranceStatus: "self_pay",
        insuranceProvider: "",
        memberId: "",
        subscriberName: ""
      })
    ).toEqual([]);
  });
});
