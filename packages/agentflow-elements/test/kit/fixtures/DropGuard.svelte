<svelte:options customElement={{ shadow: 'open' }} />

<script lang="ts">
  import { EnvironmentProvider } from '@ark-ui/svelte/environment';
  import { FileUpload } from '@ark-ui/svelte/file-upload';

  const self = $host();
</script>

<!-- Ark's File Upload with its defaults, which guard the whole document against a stray drop. -->
<EnvironmentProvider value={() => self.shadowRoot!}>
  <FileUpload.Root maxFiles={3}>
    <FileUpload.Dropzone data-testid="zone">drop</FileUpload.Dropzone>
    <FileUpload.HiddenInput />
  </FileUpload.Root>
</EnvironmentProvider>
