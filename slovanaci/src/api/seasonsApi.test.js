import { SetCurrentSeason } from './seasonsApi';
import { supabase } from './supabase';

jest.mock('./supabase', () => ({ supabase: { from: jest.fn() } }));

const seasons = [{ Id: 1, Name: 'Previous', IsCurrent: true }, { Id: 2, Name: 'Next', IsCurrent: false }];

const mockReads = () => {
  const order = jest.fn().mockResolvedValue({ data: seasons, error: null });
  supabase.from.mockReturnValueOnce({ select: jest.fn().mockReturnValue({ order }) });
};

const mockUpdate = (response) => {
  const filter = jest.fn().mockResolvedValue(response);
  const update = jest.fn().mockReturnValue({ in: filter });
  supabase.from.mockReturnValueOnce({ update });
  return { update, filter };
};

const mockActivation = (response) => {
  const single = jest.fn().mockResolvedValue(response);
  const select = jest.fn().mockReturnValue({ single });
  const eq = jest.fn().mockReturnValue({ select });
  const update = jest.fn().mockReturnValue({ eq });
  supabase.from.mockReturnValueOnce({ update });
  return { update, eq };
};

beforeEach(() => jest.resetAllMocks());

test('deactivates the previous season and activates the selection', async () => {
  mockReads();
  const previous = mockUpdate({ error: null });
  const next = mockActivation({ data: { Id: 2 }, error: null });
  await SetCurrentSeason(2);
  expect(previous.update).toHaveBeenCalledWith({ IsCurrent: false });
  expect(previous.filter).toHaveBeenCalledWith('Id', [1]);
  expect(next.update).toHaveBeenCalledWith({ IsCurrent: true });
  expect(next.eq).toHaveBeenCalledWith('Id', 2);
});

test('restores the previous season if activation fails', async () => {
  mockReads();
  mockUpdate({ error: null });
  const error = new Error('Activation failed');
  mockActivation({ error });
  const restore = mockUpdate({ error: null });
  await expect(SetCurrentSeason(2)).rejects.toThrow('Activation failed');
  expect(restore.update).toHaveBeenCalledWith({ IsCurrent: true });
  expect(restore.filter).toHaveBeenCalledWith('Id', [1]);
});

test('does not update an unknown or already current season', async () => {
  mockReads();
  await expect(SetCurrentSeason(99)).rejects.toThrow();
  expect(supabase.from).toHaveBeenCalledTimes(1);
  jest.resetAllMocks();
  mockReads();
  await SetCurrentSeason(1);
  expect(supabase.from).toHaveBeenCalledTimes(1);
});

test('does not activate the selection if deactivation fails', async () => {
  mockReads();
  mockUpdate({ error: new Error('Deactivation failed') });
  await expect(SetCurrentSeason(2)).rejects.toThrow('Deactivation failed');
  expect(supabase.from).toHaveBeenCalledTimes(2);
});