import { NEXT_PUBLIC_SERVER_PORT, NEXT_PUBLIC_SERVER_HOST, NEXT_PUBLIC_CLIENT_PORT } from '../../constants';
import * as React from 'react';

import { Box, Input, Button, Container, ListDivider, Sheet, Typography, IconButton } from '@mui/joy';
import { YTPersonaCreator } from './YTPersonaCreator';
import ScienceIcon from '@mui/icons-material/Science';

import WhatshotIcon from '@mui/icons-material/Whatshot';

import { useRouter } from 'next/router';
import axios from 'axios';
import { SystemPurposeId } from '../../data';

export function EditPersona() {
  const [id, setId] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [symbol, setSymbol] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [prompts, setPrompts] = React.useState('');
  const router = useRouter();
  const handleTitleChange = (event: any) => {
    setTitle(event.target.value);
    console.log('title:', title);
  };
  const handleDescriptionChange = (event: any) => {
    setDescription(event.target.value);
    console.log('description:', description);
  };
  const handleSymbolChange = (event: any) => {
    setSymbol(event.target.value);
    console.log('symbol:', symbol);
  };
  const handlePromptsChange = (event: any) => {
    setPrompts(event.target.value);
    console.log('prompts:', prompts);
  };
  const getPersonaByTitle = async (title: string) => {
    try {
      const response = await axios.post(`http://${NEXT_PUBLIC_SERVER_HOST}:${NEXT_PUBLIC_SERVER_PORT}/api/persona/findByTitle`, {
        title: title,
      });
      console.log('Response:', response.data);
      if (response.data[0]) {
        setSymbol(response.data[0].symbol);
        setTitle(response.data[0].title);
        setDescription(response.data[0].description);
        setPrompts(response.data[0].systemMessage);
        setId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const navigateToPersonaEdit = (title: SystemPurposeId | null) => {
    // router.push(`/editPersona/${id}`);
    router.push({
      pathname: '/editPersona',
      query: { id: title }, // Additional query params can be added here
    });
  };
  const updatePersona = async () => {
    try {
      const response = await axios.post(`http://${NEXT_PUBLIC_SERVER_HOST}:${NEXT_PUBLIC_SERVER_PORT}/api/persona/update`, {
        id: id,
        title: title,
        symbol: symbol,
        description: description,
        systemMessage: prompts,
      });
      if (response.data) {
        navigateToPersonaEdit(title as SystemPurposeId);
      }
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  React.useEffect(() => {
    const title = router.query.id;

    getPersonaByTitle(title as string);
  }, [router.query]);
  return (
    <Sheet
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        backgroundColor: 'background.level1',
        p: { xs: 3, md: 6 },
      }}
    >
      <Container disableGutters maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography level="title-lg" sx={{ textAlign: 'center' }}>
          Edit Persona Profile
        </Typography>

        <ListDivider sx={{ my: 2 }} />
        <form>
          {' '}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left', gap: 1 }}>
            <Typography>Avatar Image Url</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Input fullWidth variant="outlined" placeholder="Symbol" value={symbol} onChange={handleSymbolChange} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left', gap: 1 }}>
            <Typography>title</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Input fullWidth variant="outlined" placeholder="Title" value={title} onChange={handleTitleChange} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left', gap: 1 }}>
            <Typography>description</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Input fullWidth variant="outlined" placeholder="Description" value={description} onChange={handleDescriptionChange} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left', gap: 1 }}>
            <Typography>prompts</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <Input fullWidth variant="outlined" placeholder="Prompts" value={prompts} onChange={handlePromptsChange} />
          </Box>
          <Button className="editPersona" type="button" variant="solid" sx={{ minWidth: 120 }} onClick={updatePersona}>
            Update
          </Button>
        </form>
      </Container>
    </Sheet>
  );
}
