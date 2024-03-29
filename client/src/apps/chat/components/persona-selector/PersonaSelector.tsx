import * as React from 'react';
import { shallow } from 'zustand/shallow';

import { Box, Button, Checkbox, Grid, IconButton, Input, Stack, Textarea, Typography } from '@mui/joy';
import ClearIcon from '@mui/icons-material/Clear';
import ScienceIcon from '@mui/icons-material/Science';
import SearchIcon from '@mui/icons-material/Search';
import TelegramIcon from '@mui/icons-material/Telegram';
import Image from 'next/image'

import { DConversationId, useChatStore } from '~/common/state/store-chats';
import { Link } from '~/common/components/Link';
import { useUIPreferencesStore } from '~/common/state/store-ui';
import { useUXLabsStore } from '~/common/state/store-ux-labs';

import { SystemPurposeId, SystemPurposes } from '../../../../data';
import { usePurposeStore } from './store-purposes';

import axios from 'axios';
// Constants for tile sizes / grid width - breakpoints need to be computed here to work around
// the "flex box cannot shrink over wrapped content" issue
//
// Absolutely dislike this workaround, but it's the only way I found to make it work
import { useRouter } from 'next/router';

const bpTileSize = { xs: 100, md: 150, xl: 500 };
const tileCols = [3, 4, 6];
const tileSpacing = 1;
const bpMaxWidth = Object.entries(bpTileSize).reduce(
  (acc, [key, value], index) => {
    acc[key] = tileCols[index] * (value + 8 * tileSpacing) - 8 * tileSpacing;
    return acc;
  },
  {} as Record<string, number>,
);
const bpTileGap = { xs: 0.5, md: 1 };

// Add this utility function to get a random array element
const getRandomElement = <T,>(array: T[]): T | undefined => (array.length > 0 ? array[Math.floor(Math.random() * array.length)] : undefined);

/**
 * Purpose selector for the current chat. Clicking on any item activates it for the current chat.
 */

type OriginalDataType = {
  id: string;
  title: string;
  description: string;
  systemMessage: string;
  symbol: string;
  __v: number;
  call: {
    starters: string[];
  };
  voices: {
    elevenLabs: {
      voiceId: string;
    };
  };
  examples: string[];
};
type RequiredDataType = {
  [key: string]: {
    id: string;
    title: string;
    description: string;
    systemMessage: string;
    symbol: string;
    imageUri?: string;
    examples: string[];
    call: {
      starters: string[];
    };
    voices: {
      elevenLabs: {
        voiceId: string;
      };
    };
    highlighted?: boolean; // Add this line
  };
};
export function PersonaSelector(props: {
  initialFocusedPersona: string;
  systemPurposes: RequiredDataType;
  conversationId: DConversationId;
  runExample: (example: string) => void;
}) {
  const router = useRouter();
  const navigateToPersonaEdit = (id: string) => {
    // router.push(`/editPersona/${id}`);
    router.push({
      pathname: '/editPersona',
      query: { id: id }, // Additional query params can be added here
    });
  };
  // state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredIDs, setFilteredIDs] = React.useState<SystemPurposeId[] | null>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [editId, setEditId] = React.useState('');
  // const [systemPurposes, setSystemPurposes] = React.useState<RequiredDataType[] | {}>({});

  // external state
  const showFinder = useUIPreferencesStore((state) => state.showPurposeFinder);
  const labsPersonaYTCreator = useUXLabsStore((state) => state.labsPersonaYTCreator);
  const { systemPurposeId, setSystemPurposeId } = useChatStore((state) => {
    const conversation = state.conversations.find((conversation) => conversation.id === props.conversationId);
    return {
      systemPurposeId: conversation ? conversation.systemPurposeId : null,
      setSystemPurposeId: conversation ? state.setSystemPurposeId : null,
    };
  }, shallow);
  const { hiddenPurposeIDs, toggleHiddenPurposeId } = usePurposeStore(
    (state) => ({ hiddenPurposeIDs: state.hiddenPurposeIDs, toggleHiddenPurposeId: state.toggleHiddenPurposeId }),
    shallow,
  );

  // safety check - shouldn't happen
  if (!systemPurposeId || !setSystemPurposeId) return null;

  const handleSearchClear = () => {
    setSearchQuery('');
    setFilteredIDs(null);
  };

  const handleSearchOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (!query) return handleSearchClear();
    setSearchQuery(query);

    // Filter results based on search term
    const ids = Object.keys(props.systemPurposes)
      .filter((key) => props.systemPurposes?.hasOwnProperty(key))
      .filter((key) => {
        const purpose = props.systemPurposes[key as SystemPurposeId];
        return (
          purpose.title.toLowerCase().includes(query.toLowerCase()) ||
          (typeof purpose.description === 'string' && purpose.description.toLowerCase().includes(query.toLowerCase()))
        );
      });
    setFilteredIDs(ids as SystemPurposeId[]);

    // If there's a search term, activate the first item
    if (ids.length && !ids.includes(systemPurposeId)) handlePurposeChanged(ids[0] as SystemPurposeId);
  };

  const handleSearchOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key == 'Escape') handleSearchClear();
  };

  const toggleEditMode = async () => {
    const newEditId = props.initialFocusedPersona;
    setEditId(newEditId); // This will schedule the state to be updated
    navigateToPersonaEdit(newEditId as string); // Use the new value directly
  };
  const goToCreatePersona = () => {
    // router.push(`/createPersona`);
    router.push({
      pathname: '/createPersona',
    });
  };
  const goToCreateCategory = () => {
    // router.push(`/createPersona`);
    router.push({
      pathname: '/category/createCategory',
    });
  };

  const handlePurposeChanged = (purposeId: SystemPurposeId | null) => {
    if (purposeId) {
      setSystemPurposeId(props.conversationId, purposeId);
      setEditId(props.systemPurposes[purposeId as string].id);
    }
  };

  const handleCustomSystemMessageChange = (v: React.ChangeEvent<HTMLTextAreaElement>): void => {
    // TODO: persist this change? Right now it's reset every time.
    //       maybe we shall have a "save" button just save on a state to persist between sessions
    props.systemPurposes['Custom'].systemMessage = v.target.value;
  };

  // we show them all if the filter is clear (null)
  const unfilteredPurposeIDs = filteredIDs && showFinder ? filteredIDs : Object.keys(props.systemPurposes);
  const purposeIDs = editMode ? unfilteredPurposeIDs : unfilteredPurposeIDs.filter((id) => !hiddenPurposeIDs.includes(id));

  const selectedPurpose = purposeIDs.length ? props.systemPurposes[systemPurposeId] ?? null : null;
  const selectedExample = (selectedPurpose?.examples && getRandomElement(selectedPurpose.examples)) || null;

  return (
    <>
      {showFinder && (
        <Box sx={{ p: 2 * tileSpacing }}>
          <Input
            fullWidth
            variant="outlined"
            color="neutral"
            value={searchQuery}
            onChange={handleSearchOnChange}
            onKeyDown={handleSearchOnKeyDown}
            placeholder="Search for purpose…"
            startDecorator={<SearchIcon />}
            endDecorator={
              searchQuery && (
                <IconButton variant="plain" color="neutral" onClick={handleSearchClear}>
                  <ClearIcon />
                </IconButton>
              )
            }
            sx={{
              boxShadow: 'sm',
            }}
          />
        </Box>
      )}

      <Stack direction="column" sx={{ minHeight: '60vh', justifyContent: 'center', alignItems: 'center' }}>
        <Box maxWidth={bpMaxWidth}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 2,
              mb: 1,
            }}
          >
            <Typography level="title-sm">AI Persona</Typography>
            <Button variant="plain" color="neutral" size="sm" onClick={goToCreatePersona}>
              Create
            </Button>
            <Button variant="plain" color="neutral" size="sm" onClick={toggleEditMode}>
              {editMode ? 'Done' : 'Edit'}
            </Button>
          </Box>

          <Grid container spacing={tileSpacing} sx={{ justifyContent: 'center' }}>
            {purposeIDs.map((spId) => (
              <Grid key={spId}>
                <Button
                  variant={!editMode && systemPurposeId === spId ? 'solid' : 'soft'}
                  color={!editMode && systemPurposeId === spId ? 'primary' : props.systemPurposes[spId as SystemPurposeId].highlighted ? 'warning' : 'neutral'}
                  onClick={() => !editMode && handlePurposeChanged(spId as SystemPurposeId)}
                  sx={{
                    position: "relative",
                    flexDirection: 'column',
                    fontWeight: 500,
                    gap: bpTileGap,
                    height: "200px",
                    width: "200px",
                    marginLeft: "20px",
                    ...(editMode || systemPurposeId !== spId
                      ? {
                          boxShadow: 'md',
                          ...(props.systemPurposes[spId as SystemPurposeId]?.highlighted ? {} : { backgroundColor: 'background.surface' }),
                        }
                      : {}),
                  }}
                >
                  {editMode && (
                    <Checkbox
                      label={<Typography level="body-sm">show</Typography>}
                      checked={!hiddenPurposeIDs.includes(spId)}
                      onChange={() => toggleHiddenPurposeId(spId)}
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  )}
                  <div >
                    <Image
                      layout="fill"
                      src={props.systemPurposes[spId as SystemPurposeId]?.symbol}
                      alt="Picture of the author"
                    />
                    </div>
                  <p style={{ fontSize: '1rem', zIndex:3, bottom: 0, position: "absolute", margin: 0 }}>{props.systemPurposes[spId as SystemPurposeId]?.title}</p>
                </Button>
              </Grid>
            ))}
          </Grid>
          <Typography
            level="body-sm"
            sx={{
              width:"700px",
              mt: selectedExample ? 1 : 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              // justifyContent: 'center',
              '&:hover > button': { opacity: 1 },
            }}
          >
            {!selectedPurpose ? (
              'Oops! No AI persona found for your search.'
            ) : selectedExample ? (
              <>
                Example: {selectedExample}
                <IconButton
                  variant="plain"
                  color="primary"
                  size="md"
                  onClick={() => props.runExample(selectedExample)}
                  sx={{ opacity: 0, transition: 'opacity 0.3s' }}
                >
                  <TelegramIcon />
                </IconButton>
              </>
            ) : (
              selectedPurpose.description
            )}
          </Typography>

          {systemPurposeId === 'Custom' && (
            <Textarea
              variant="outlined"
              autoFocus
              placeholder={'Craft your custom system message here…'}
              minRows={3}
              defaultValue={props.systemPurposes['Custom']?.systemMessage}
              onChange={handleCustomSystemMessageChange}
              sx={{
                backgroundColor: 'background.level1',
                '&:focus-within': {
                  backgroundColor: 'background.popup',
                },
                lineHeight: 1.75,
                mt: 1,
              }}
            />
          )}
          <Button className="editPersona" type="button" variant="solid" onClick={goToCreateCategory} sx={{ marginRight: 2 }}>
            Add Category
          </Button>
        </Box>
      </Stack>
    </>
  );
}
