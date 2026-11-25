/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/*==============================================================*/


drop table if exists TABEL_PELANGGAN;

drop table if exists TABEL_PENGADUAN;

drop table if exists TABEL_PENGADUAN_FILE;

drop table if exists TABEL_PENGADUAN_FILE_ITEM;

drop table if exists TABEL_USER;

/*==============================================================*/
/* Table: TABEL_PELANGGAN                                       */
/*==============================================================*/
create table TABEL_PELANGGAN
(
   ID_PELANGGAN         varchar(36) not null,
   NO_KONTAK_PDAM       varchar(50),
   NAMA_PELANGGAN       varchar(255) not null,
   NO_HP                varchar(20) not null,
   ALAMAT               text,
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
   TAB_ID_USER          varchar(36),
   KELUHAN              text not null,
   STATUS               varchar(20) not null,
   LATITUDE             varchar(50),
   LONGITUDE            varchar(50),
   TANGGAL_DITERIMA     datetime not null,
   TANGGAL_DIPROSES     datetime,
   TANGGAL_SELESAI      datetime,
   CREATED_AT           timestamp not null,
   UPDATED_AT           timestamp,
   SALURAN_KELUHAN      ENUM('Datang Langsung', 'Via Telepon', 'Temuan Lapangan') not null,
   SUMBER_ADUAN         ENUM('Pelanggan', 'Non Pelangan') not null,
   primary key (ID_PENGADUAN)
);

/*==============================================================*/
/* Table: TABEL_PENGADUAN_FILE                                  */
/*==============================================================*/
create table TABEL_PENGADUAN_FILE
(
   DOKUMEN_LAPORAN_DATA MEDIUMBLOB,
   DOKUMEN_LAPORAN_MIME varchar(100),
   DOKUMEN_LAPORAN_NAMA varchar(255),
   FOTO_KELUHAN_DATA    MEDIUMBLOB,
   FOTO_KELUHAN_MIME    varchar(100),
   FOTO_KELUHAN_NAMA    varchar(255),
   ID_PENGADUAN         varchar(36) not null,
   primary key (ID_PENGADUAN)
);

/*==============================================================*/
/* Table: TABEL_PENGADUAN_FILE_ITEM                             */
/*==============================================================*/
create table TABEL_PENGADUAN_FILE_ITEM
(
   ID_FILE              varchar(36) not null,
   ID_PENGADUAN         varchar(36) not null,
   JENIS_FILE           varchar(20) not null,
   NAMA_FILE            varchar(255) not null,
   MIME_TYPE            varchar(100) not null,
   FILE_DATA            MEDIUMBLOB not null,
   CREATED_AT           timestamp,
   primary key (ID_FILE)
);

/*==============================================================*/
/* Table: TABEL_USER                                            */
/*==============================================================*/
create table TABEL_USER
(
   ID_USER              varchar(36) not null,
   NAMA_USER            varchar(100) not null,
   EMAIL                varchar(255) not null,
   USERNAME             varchar(255) not null,
   PASSWORD             varchar(255) not null,
   ROLE                 ENUM('Super Admin', 'CS','Operator','Pengawas') not null,
   CREATED_AT           timestamp,
   primary key (ID_USER),
   key AK_IDENTIFIRE_EMAIL (EMAIL),
   key AK_IDENTIFIER_USERNAME (USERNAME)
);

alter table TABEL_PENGADUAN add constraint FK_MEMBUAT foreign key (ID_PELANGGAN)
      references TABEL_PELANGGAN (ID_PELANGGAN) on delete restrict on update restrict;

alter table TABEL_PENGADUAN add constraint FK_MEMILIKI_FILE_LAMA foreign key (ID_PENGADUAN)
      references TABEL_PENGADUAN_FILE (ID_PENGADUAN) on delete restrict on update restrict;

alter table TABEL_PENGADUAN add constraint FK_MENANGANI foreign key (TAB_ID_USER)
      references TABEL_USER (ID_USER) on delete restrict on update restrict;

alter table TABEL_PENGADUAN add constraint FK_MENERIMA foreign key (ID_USER)
      references TABEL_USER (ID_USER) on delete restrict on update restrict;

alter table TABEL_PENGADUAN_FILE_ITEM add constraint FK_MEMILIKI_FILE_ITEM foreign key (ID_PENGADUAN)
      references TABEL_PENGADUAN (ID_PENGADUAN) on delete restrict on update restrict;

