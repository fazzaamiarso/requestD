import { trpc } from "../../utils/trpc";

const NewSubmission = () => {
  const mutation = trpc.useMutation("submission.create");
  return (
    <main>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const title = formData.get("title") as string;

          mutation.mutate(
            { title },
            {
              onSuccess(data, variables, context) {
                window.location.replace(`/me/${data.submissionId}`);
              },
            }
          );
        }}
      >
        <label htmlFor="title">Playlist title</label>
        <input type="text" required id="title" name="title" />
        <button type="submit">Create</button>
      </form>
    </main>
  );
};

export default NewSubmission;
