import { createRouter } from "./context";

const submissionRouter = createRouter().query("all", {
  async resolve({ ctx }) {
    const test = await ctx.prisma.submission.findMany();

    return { data: test };
  },
});

export default submissionRouter;
