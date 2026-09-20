/**
 * SAM Local Handler: Ward Routing & Policy Validation
 * Evaluates authorization policy and assigns ward coordinates.
 */
export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : (event.body || {});
    const { coordinates, category, location, imageQuality = 0.9 } = body;

    // Validation (Cedar routing policy equivalence)
    if (!location || !location.trim()) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Location is required before routing." }),
      };
    }

    if (imageQuality < 0.60) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Image quality threshold of 0.60 not met." }),
      };
    }

    // Ward coordinate lookup
    const lat = coordinates?.lat ?? 12.9716;
    const lng = coordinates?.lng ?? 77.5946;

    let ward = "Ward 151 · Koramangala";
    if (lat > 12.975 && lng > 77.63) {
      ward = "Ward 113 · Hoysala Nagar";
    } else if (lat > 12.99 && lng < 77.58) {
      ward = "Ward 65 · Kadu Malleshwaram";
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ward,
        coordinates: { lat, lng },
        category: category || "Civic Issue",
        policyStatus: "AUTHORIZED_BY_CEDAR",
        routedAt: new Date().toISOString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
