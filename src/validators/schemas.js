const { z } = require("zod");

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
});

const optionalPaginationQuery = paginationQuery.partial();
const emptyParams = z.object({});
const emptyQuery = z.object({});
const emptyBody = z.object({});

const categoryEnum = z.enum(["SEEDS", "TOOLS", "ORGANIC_PRODUCE", "COMPOST", "OTHER"]);
const certificationEnum = z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]);
const rentalAvailabilityEnum = z.enum(["AVAILABLE", "BOOKED", "INACTIVE"]);
const orderStatusEnum = z.enum(["PENDING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"]);
const plantStatusEnum = z.enum(["PLANTED", "GERMINATING", "GROWING", "HARVEST_READY", "HARVESTED"]);
const plantHealthEnum = z.enum(["EXCELLENT", "GOOD", "NEEDS_ATTENTION", "CRITICAL"]);

const nameField = z.string().trim().min(2).max(120);
const emailField = z.string().trim().email().max(160);
const passwordField = z.string().min(8).max(128);

const atLeastOneField = (value) => Object.keys(value).length > 0;

const registerCustomerSchema = z.object({
  params: emptyParams,
  query: emptyQuery,
  body: z.object({
    name: nameField,
    email: emailField,
    password: passwordField
  })
});

const registerVendorSchema = z.object({
  params: emptyParams,
  query: emptyQuery,
  body: z.object({
    name: nameField,
    email: emailField,
    password: passwordField,
    farmName: z.string().trim().min(2).max(160),
    farmLocation: z.string().trim().min(2).max(200)
  })
});

const loginSchema = z.object({
  params: emptyParams,
  query: emptyQuery,
  body: z.object({
    email: emailField,
    password: z.string().min(1)
  })
});

const vendorProfileUpdateSchema = z.object({
  params: emptyParams,
  query: emptyQuery,
  body: z.object({
    farmName: z.string().trim().min(2).max(160).optional(),
    farmLocation: z.string().trim().min(2).max(200).optional()
  }).refine(atLeastOneField, {
    message: "At least one profile field is required."
  })
});

const sustainabilityCertCreateSchema = z.object({
  params: emptyParams,
  query: emptyQuery,
  body: z.object({
    certifyingAgency: z.string().trim().min(2).max(160),
    certificationDate: z.coerce.date(),
    certificateUrl: z.string().trim().url().optional(),
    notes: z.string().trim().max(500).optional()
  })
});

const produceCreateSchema = z.object({
  params: emptyParams,
  query: emptyQuery,
  body: z.object({
    name: z.string().trim().min(2).max(160),
    description: z.string().trim().min(10).max(500),
    price: z.coerce.number().positive(),
    category: categoryEnum,
    availableQuantity: z.coerce.number().int().min(0)
  })
});

const produceUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  query: emptyQuery,
  body: z.object({
    name: z.string().trim().min(2).max(160).optional(),
    description: z.string().trim().min(10).max(500).optional(),
    price: z.coerce.number().positive().optional(),
    category: categoryEnum.optional(),
    availableQuantity: z.coerce.number().int().min(0).optional()
  }).refine(atLeastOneField, {
    message: "At least one produce field is required."
  })
});

const produceListSchema = z.object({
  params: emptyParams,
  query: optionalPaginationQuery.extend({
    search: z.string().trim().optional(),
    category: categoryEnum.optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional()
  }),
  body: emptyBody
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  query: emptyQuery,
  body: emptyBody
});

const rentalSpaceCreateSchema = z.object({
  params: emptyParams,
  query: emptyQuery,
  body: z.object({
    location: z.string().trim().min(2).max(200),
    size: z.string().trim().min(2).max(120),
    price: z.coerce.number().positive(),
    availability: rentalAvailabilityEnum.optional()
  })
});

const rentalSpaceUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  query: emptyQuery,
  body: z.object({
    location: z.string().trim().min(2).max(200).optional(),
    size: z.string().trim().min(2).max(120).optional(),
    price: z.coerce.number().positive().optional(),
    availability: rentalAvailabilityEnum.optional()
  }).refine(atLeastOneField, {
    message: "At least one rental space field is required."
  })
});

const rentalSpaceListSchema = z.object({
  params: emptyParams,
  query: optionalPaginationQuery.extend({
    location: z.string().trim().optional(),
    availability: rentalAvailabilityEnum.optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional()
  }),
  body: emptyBody
});

const bookingCreateSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  query: emptyQuery,
  body: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional()
  })
});

const orderCreateSchema = z.object({
  params: emptyParams,
  query: emptyQuery,
  body: z.object({
    produceId: z.string().min(1),
    quantity: z.coerce.number().int().min(1)
  })
});

const orderListSchema = z.object({
  params: emptyParams,
  query: optionalPaginationQuery.extend({
    status: orderStatusEnum.optional()
  }),
  body: emptyBody
});

const orderStatusUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  query: emptyQuery,
  body: z.object({
    status: orderStatusEnum
  })
});

const communityPostCreateSchema = z.object({
  params: emptyParams,
  query: emptyQuery,
  body: z.object({
    postContent: z.string().trim().min(5).max(1000)
  })
});

const communityPostUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  query: emptyQuery,
  body: z.object({
    postContent: z.string().trim().min(5).max(1000)
  })
});

const communityListSchema = z.object({
  params: emptyParams,
  query: optionalPaginationQuery,
  body: emptyBody
});

const plantRecordCreateSchema = z.object({
  params: emptyParams,
  query: emptyQuery,
  body: z.object({
    plantName: z.string().trim().min(2).max(160),
    growthStage: z.string().trim().min(2).max(120),
    status: plantStatusEnum.optional(),
    healthStatus: plantHealthEnum.optional(),
    expectedHarvestAt: z.coerce.date().optional(),
    notes: z.string().trim().max(1000).optional(),
    rentalBookingId: z.string().min(1).optional()
  })
});

const plantRecordUpdateSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  query: emptyQuery,
  body: z.object({
    plantName: z.string().trim().min(2).max(160).optional(),
    growthStage: z.string().trim().min(2).max(120).optional(),
    status: plantStatusEnum.optional(),
    healthStatus: plantHealthEnum.optional(),
    expectedHarvestAt: z.coerce.date().optional(),
    notes: z.string().trim().max(1000).optional()
  }).refine(atLeastOneField, {
    message: "At least one plant field is required."
  })
});

const plantListSchema = z.object({
  params: emptyParams,
  query: optionalPaginationQuery.extend({
    status: plantStatusEnum.optional()
  }),
  body: emptyBody
});

const vendorApprovalSchema = z.object({
  params: z.object({
    vendorProfileId: z.string().min(1)
  }),
  query: emptyQuery,
  body: z.object({
    isApproved: z.boolean(),
    approvalNotes: z.string().trim().max(500).optional()
  })
});

const certificationReviewSchema = z.object({
  params: z.object({
    certId: z.string().min(1)
  }),
  query: emptyQuery,
  body: z.object({
    certificationStatus: certificationEnum,
    notes: z.string().trim().max(500).optional()
  })
});

const produceReviewSchema = z.object({
  params: z.object({
    produceId: z.string().min(1)
  }),
  query: emptyQuery,
  body: z.object({
    isApproved: z.boolean(),
    certificationStatus: certificationEnum.optional()
  })
});

module.exports = {
  registerCustomerSchema,
  registerVendorSchema,
  loginSchema,
  vendorProfileUpdateSchema,
  sustainabilityCertCreateSchema,
  produceCreateSchema,
  produceUpdateSchema,
  produceListSchema,
  idParamSchema,
  rentalSpaceCreateSchema,
  rentalSpaceUpdateSchema,
  rentalSpaceListSchema,
  bookingCreateSchema,
  orderCreateSchema,
  orderListSchema,
  orderStatusUpdateSchema,
  communityPostCreateSchema,
  communityPostUpdateSchema,
  communityListSchema,
  plantRecordCreateSchema,
  plantRecordUpdateSchema,
  plantListSchema,
  vendorApprovalSchema,
  certificationReviewSchema,
  produceReviewSchema
};
