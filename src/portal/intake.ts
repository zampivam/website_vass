export type FamilyIntakeInput = {
  caregiverFirstName: string;
  caregiverLastName: string;
  relationship: string;
  phone: string;
  preferredContact: "email" | "phone";
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

export type ChildIntakeInput = {
  firstName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
  school: string;
  grade: string;
  diagnosisStatus: "diagnosed" | "seeking_assessment" | "unsure";
  primaryLanguage: string;
  requestedServices: string[];
  insuranceStatus: "insured" | "self_pay" | "unsure";
  insuranceProvider: string;
  memberId: string;
  groupNumber: string;
  subscriberName: string;
  subscriberRelationship: string;
};

function trim(value: string): string {
  return value.trim();
}

export function normalizeFamilyIntake(input: FamilyIntakeInput): FamilyIntakeInput {
  return {
    caregiverFirstName: trim(input.caregiverFirstName),
    caregiverLastName: trim(input.caregiverLastName),
    relationship: trim(input.relationship),
    phone: trim(input.phone),
    preferredContact: input.preferredContact,
    addressLine1: trim(input.addressLine1),
    addressLine2: trim(input.addressLine2),
    city: trim(input.city),
    state: trim(input.state).toUpperCase(),
    postalCode: trim(input.postalCode)
  };
}

export function normalizeChildIntake(input: ChildIntakeInput): ChildIntakeInput {
  return {
    firstName: trim(input.firstName),
    lastName: trim(input.lastName),
    preferredName: trim(input.preferredName),
    dateOfBirth: trim(input.dateOfBirth),
    school: trim(input.school),
    grade: trim(input.grade),
    diagnosisStatus: input.diagnosisStatus,
    primaryLanguage: trim(input.primaryLanguage),
    requestedServices: [...input.requestedServices],
    insuranceStatus: input.insuranceStatus,
    insuranceProvider: trim(input.insuranceProvider),
    memberId: trim(input.memberId),
    groupNumber: trim(input.groupNumber),
    subscriberName: trim(input.subscriberName),
    subscriberRelationship: trim(input.subscriberRelationship)
  };
}

export function validateIntake(familyInput: FamilyIntakeInput, childInput: ChildIntakeInput): string[] {
  const family = normalizeFamilyIntake(familyInput);
  const child = normalizeChildIntake(childInput);
  const errors: string[] = [];

  if (!family.caregiverFirstName) errors.push("Caregiver first name is required.");
  if (!family.caregiverLastName) errors.push("Caregiver last name is required.");
  if (!family.phone) errors.push("Caregiver phone is required.");
  if (!family.addressLine1) errors.push("Street address is required.");
  if (!family.city) errors.push("City is required.");
  if (!family.state) errors.push("State is required.");
  if (!family.postalCode) errors.push("Postal code is required.");
  if (!child.firstName) errors.push("Child first name is required.");
  if (!child.lastName) errors.push("Child last name is required.");
  if (!child.dateOfBirth) errors.push("Child date of birth is required.");

  if (child.insuranceStatus === "insured") {
    if (!child.insuranceProvider) errors.push("Insurance provider is required.");
    if (!child.memberId) errors.push("Insurance member ID is required.");
    if (!child.subscriberName) errors.push("Insurance subscriber name is required.");
  }

  return errors;
}
