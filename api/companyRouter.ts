import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { isOwner } from "@contracts/roles";
import { authedQuery, createRouter, ownerQuery, publicQuery } from "./middleware";
import {
  ensureDefaultBusiness,
  findAllCompanies,
  findCompaniesByType,
  findCompanyById,
  findCompanyBySlug,
  searchCompanies,
} from "./queries/companies";

function canAccessCompany(input: {
  user: { role?: string | null; email?: string | null; companyId?: number | null };
  companyId: number;
}) {
  return (
    input.user.role === "admin" ||
    isOwner(input.user) ||
    input.user.companyId === input.companyId
  );
}

export const companyRouter = createRouter({
  default: publicQuery.query(async () => {
    return ensureDefaultBusiness();
  }),

  list: ownerQuery
    .input(
      z
        .object({
          type: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      if (input?.type) {
        return findCompaniesByType(input.type);
      }
      return findAllCompanies();
    }),

  byId: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const company = await findCompanyById(input.id);
      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found.",
        });
      }
      if (!canAccessCompany({ user: ctx.user, companyId: company.id })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this company.",
        });
      }
      return company;
    }),

  bySlug: authedQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const company = await findCompanyBySlug(input.slug);
      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found.",
        });
      }
      if (!canAccessCompany({ user: ctx.user, companyId: company.id })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this company.",
        });
      }
      return company;
    }),

  search: ownerQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return searchCompanies(input.query);
    }),
});
