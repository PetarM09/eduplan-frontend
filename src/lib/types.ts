/**
 * TypeScript ogledalo backend DTO-a. Sva imena polja se podudaraju sa
 * Java record-ima u backend-u (npr. {@code KorisnikResponse}, {@code PredmetResponse}).
 */

import type { Uloga } from '@/context/AuthContext';
export type { Uloga };

// =============== KORISNICI ===============

export interface KorisnikResponse {
  id: string;
  skolaId: string | null;
  username: string;
  email: string;
  ime: string;
  prezime: string;
  uloga: Uloga;
  aktivan: boolean;
}

export interface KreirajKorisnikaRequest {
  username: string;
  email: string;
  lozinka: string;
  ime: string;
  prezime: string;
  uloga: Uloga;
}

// =============== PREDMETI ===============

export interface PredmetResponse {
  id: string;
  naziv: string;
  razred: number | null;
  fondCasova: number | null;
  aktivan: boolean;
  odeljenja: OdeljenjeKratko[];
}

export interface OdeljenjeKratko {
  id: string;
  label: string;
}

export interface KreirajPredmetRequest {
  naziv: string;
  razred?: number | null;
  fondCasova?: number | null;
}

// =============== ODELJENJA ===============

export interface OdeljenjeResponse {
  id: string;
  razred: number;
  oznaka: string;
  skolskaGodina: string;
  staresinaId: string | null;
  staresinaIme: string | null;
  aktivan: boolean;
  label: string;
}

export interface KreirajOdeljenjeRequest {
  razred: number;
  oznaka: string;
  skolskaGodina: string;
  staresinaId?: string | null;
}

// =============== KATALOG ===============

export interface TemaResponse {
  id: string;
  predmetId: string;
  redniBroj: number;
  naziv: string;
  casObrada: number;
  casUtvrd: number;
  casOstalo: number;
}

export interface NastavnaJedinicaResponse {
  id: string;
  temaId: string;
  redniBroj: number | null;
  naziv: string;
}

export interface IshodResponse {
  id: string;
  temaId: string;
  opis: string;
}

export interface PadajuciMeniResponse {
  id: string;
  naziv: string;
  sistemski: boolean;
}

// =============== ZAMENE ===============

export type ZamenaStatus = 'PREDLOZENA' | 'ODOBRENA' | 'ODBIJENA' | 'OTKAZANA';

export interface ZamenaResponse {
  id: string;
  datum: string;
  cas: number;
  odsutniId: string;
  odsutniIme: string;
  zamenikId: string | null;
  zamenikIme: string | null;
  odeljenjeId: string | null;
  odeljenjeLabel: string | null;
  predmetLabel: string | null;
  razlog: string | null;
  napomena: string | null;
  status: ZamenaStatus;
  odobrioId: string | null;
  odobrioIme: string | null;
  odobrioAt: string | null;
  createdAt: string;
}

// =============== PLANOVI ===============

export type PlanStatus = 'NACRT' | 'PODNET' | 'VRACENO_NA_DORADU' | 'ARHIVIRAN';

export const MESECI_KEYS = ['IX', 'X', 'XI', 'XII', 'I', 'II', 'III', 'IV', 'V', 'VI'] as const;
export type MesecKey = (typeof MESECI_KEYS)[number];

// ----- Godisnji plan -----

export interface GodisnjiPlanResponse {
  id: string;
  nastavnikId: string;
  nastavnikIme: string;
  predmetId: string;
  predmetNaziv: string;
  razred: number | null;
  skolskaGodina: string;
  odeljenjaIds: string[];
  ciljeviZadaci: string | null;
  udzebenik: string | null;
  autori: string | null;
  literatura: string | null;
  godisnjiFond: number | null;
  nedeljniFond: number | null;
  dopunskiRad: string | null;
  dodatniRad: string | null;
  napomene: string | null;
  status: PlanStatus;
  podnetAt: string | null;
  imaWord: boolean;
  imaPdf: boolean;
  teme: GodisnjiPlanTemaResponse[];
  createdAt: string;
  updatedAt: string | null;
}

export interface GodisnjiPlanTemaResponse {
  id: string;
  temaId: string;
  nazivTeme: string;
  redniBroj: number;
  meseci: Record<string, boolean>;
  casObrada: number;
  casUtvrd: number;
  casOstalo: number;
  ukupnoCasova: number;
  ishodi: { id: string; opis: string }[];
}

export interface KreirajGodisnjiPlanRequest {
  predmetId: string;
  skolskaGodina: string;
  razred?: number | null;
  odeljenjaIds?: string[];
  ciljeviZadaci?: string | null;
  udzebenik?: string | null;
  autori?: string | null;
  literatura?: string | null;
  godisnjiFond?: number | null;
  nedeljniFond?: number | null;
  dopunskiRad?: string | null;
  dodatniRad?: string | null;
  napomene?: string | null;
  teme: GodisnjiPlanTemaRequest[];
}

export interface GodisnjiPlanTemaRequest {
  temaId?: string | null;
  nazivTeme?: string | null;
  redniBroj?: number | null;
  casObrada?: number | null;
  casUtvrd?: number | null;
  casOstalo?: number | null;
  ukupnoCasova?: number | null;
  meseci?: string[];
  ishodiIds?: string[] | null;
  noviIshodi?: string[] | null;
}

// ----- Operativni plan -----

export interface OperativniPlanResponse {
  id: string;
  nastavnikId: string;
  nastavnikIme: string;
  predmetId: string;
  predmetNaziv: string;
  odeljenjeId: string;
  odeljenjeLabel: string;
  mesec: number;
  skolskaGodina: string;
  nedeljniFond: number | null;
  samoprocenaIshoda: string | null;
  napomene: string | null;
  status: PlanStatus;
  podnetAt: string | null;
  imaWord: boolean;
  imaPdf: boolean;
  stavke: OpStavkaResponse[];
  createdAt: string;
  updatedAt: string | null;
}

export interface OpStavkaResponse {
  id: string;
  redniBrojCasa: number;
  temaId: string | null;
  nazivTeme: string | null;
  nastavnaJedinicaId: string | null;
  nazivJedinice: string | null;
  tipCasaId: string | null;
  tipCasa: string | null;
  metodaRadaId: string | null;
  metodaRada: string | null;
  evaluacija: string | null;
  ishodi: { id: string; opis: string }[];
  medjupredmetno: { id: string; predmetId: string; predmetNaziv: string; opisKompetencije: string }[];
}

export interface KreirajOperativniPlanRequest {
  predmetId: string;
  odeljenjeId: string;
  mesec: number;
  skolskaGodina: string;
  nedeljniFond?: number | null;
  samoprocenaIshoda?: string | null;
  napomene?: string | null;
  stavke: OpStavkaRequest[];
}

export interface OpStavkaRequest {
  redniBrojCasa: number;
  temaId?: string | null;
  nazivTeme?: string | null;
  nastavnaJedinicaId?: string | null;
  nazivJedinice?: string | null;
  tipCasaId: string;
  metodaRadaId?: string | null;
  ishodiIds?: string[] | null;
  noviIshodi?: string[] | null;
  medjupredmetno?: MedjupredmetnoRequest[];
  evaluacija?: string | null;
}

export interface MedjupredmetnoRequest {
  predmetId: string;
  opisKompetencije: string;
}

// =============== RASPORED ===============

export type Dan = 'PONEDELJAK' | 'UTORAK' | 'SREDA' | 'CETVRTAK' | 'PETAK' | 'SUBOTA';

export interface RasporedStavkaResponse {
  id: string;
  dan: Dan;
  cas: number;
  korisnikId: string | null;
  korisnikIme: string | null;
  odeljenjeId: string | null;
  odeljenjeLabel: string | null;
  predmetLabel: string | null;
}
