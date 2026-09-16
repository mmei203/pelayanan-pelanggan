/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     16/09/2026 12:17:47                          */
/*==============================================================*/


drop table if exists TABEL_PELANGGAN;

drop table if exists TABEL_PENGADUAN;

drop table if exists TABEL_USER;

/*==============================================================*/
/* Table: TABEL_PELANGGAN                                       */
/*==============================================================*/
create table TABEL_PELANGGAN
(
   ID_PELANGGAN         varchar(36) not null,
   NO_KONTAK_PDAM       varchar(50),
   NAMA_PELANGGAN       varchar(100) not null,
   NO_HP                varchar(20) not null,
   ALAMAT               longtext,
   CREATED_AT           timestamp,
   primary key (ID_PELANGGAN),
   key AK_IDENTIFIER_NO_KONTAK_PDAM (NO_KONTAK_PDAM)
);

/*==============================================================*/
/* Table: TABEL_PENGADUAN                                       */
/*==============================================================*/
create table TABEL_PENGADUAN
(
   ID_PENGADUAN         varchar(36) not null,
   ID_PELANGGAN         varchar(36) not null,
   ID_USER              varchar(36) not null,
   ID_OPERATOR          varchar(36),
   KELUHAN              longtext not null,
   STATUS               varchar(20) not null,
   LATITUDE             varchar(50),
   LONGITUDE            varchar(50),
   DOKUMEN_LAPORAN      varchar(255),
   FOTO_KELUHAN         varchar(255),
   TANGGAL_DITERIMA     datetime not null,
   TANGGAL_DIPROSES     datetime,
   TANGGAL_SELESAI      datetime,
   CREATED_AT           timestamp not null,
   UPDATED_AT           timestamp,
   primary key (ID_PENGADUAN)
);

/*==============================================================*/
/* Table: TABEL_USER                                            */
/*==============================================================*/
create table TABEL_USER
(
   ID_USER              varchar(36) not null,
   NAMA_USER            varchar(100) not null,
   EMAIL                varchar(100) not null,
   USERNAME             varchar(50) not null,
   PASSWORD             varchar(255) not null,
   ROLE                 varchar(20) not null,
   CREATED_AT           timestamp,
   primary key (ID_USER),
   key AK_IDENTIFIRE_EMAIL (EMAIL),
   key AK_IDENTIFIER_USERNAME (USERNAME)
);

alter table TABEL_PENGADUAN add constraint FK_MEMBUAT foreign key (ID_PELANGGAN)
      references TABEL_PELANGGAN (ID_PELANGGAN) on delete restrict on update restrict;

alter table TABEL_PENGADUAN add constraint FK_MENANGANI foreign key (ID_OPERATOR)
      references TABEL_USER (ID_USER) on delete restrict on update restrict;

alter table TABEL_PENGADUAN add constraint FK_MENERIMA foreign key (ID_USER)
      references TABEL_USER (ID_USER) on delete restrict on update restrict;

