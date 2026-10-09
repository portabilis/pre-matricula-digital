import { Ref, ref } from 'vue';

export function useLoader<T>(
  initialData?: T,
  err?: (error: Error, reject: typeof Promise.reject) => void
) {
  const loading = ref<boolean>(false);
  const data: Ref<T> = ref(initialData) as Ref<T>;
  const errors: Ref<T> = ref() as Ref<T>;

  const loader = (callback: () => Promise<T>): Promise<T> => {
    if (loading.value) return Promise.resolve(initialData as T);

    loading.value = true;

    /**
     * Basically, the Promise coming from the `Api` module ends here.
     * The `.vue` component will receive a new Promise only with the `resolve()` block,
     * and if the vue component needs to get the error, it will get the `errors` variable.
     * The purpose of this is to avoid Promise cascading conflicts, especially in unit testing environments.
     * Another point that we must also highlight, is that if there are errors that we must show to the user,
     * we must use the functions inside `useLoaderAndShowErrors()`.
     */
    return new Promise((resolve, reject) =>
      callback()
        .then((res) => {
          data.value = res as T;

          resolve(data.value);
        })
        .catch((error) => {
          if (err) {
            err(error, reject as typeof Promise.reject);
          }

          errors.value = error;
          reject(error);
        })
        .finally(() => {
          loading.value = false;
        })
    );
  };

  return {
    data,
    errors,
    loader,
    loading,
  };
}
