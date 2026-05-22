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
