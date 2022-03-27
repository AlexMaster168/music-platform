import React, { useState } from "react"
import MainLayout from "../../layouts/MainLayout"
import { Box, Button, Card, Grid, TextField } from "@material-ui/core"
import { useRouter } from "next/router"
import TrackList from "../../components/TrackList"
import { useTypedSelector } from "../../hooks/useTypedSelector"
import { NextThunkDispatch, wrapper } from "../../store"
import { fetchTracks, searchTracks } from "../../store/actions-creators/track"
import { useDispatch } from "react-redux"

const Index = () => {
   const router = useRouter()
   const { tracks, error } = useTypedSelector(state => state.track)
   const [query, setQuery] = useState<string>("")
   const dispatch = useDispatch() as NextThunkDispatch

   const search = async (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value)
      await dispatch(await searchTracks(e.target.value))
   }

   if (error) {
      return <MainLayout>
         <h1>{error}</h1>
      </MainLayout>
   }

   return (
      <MainLayout title={"Список треков - музыкальная площадка"}>
         <Grid container justifyContent="center">
            <Card style={{ width: 900 }}>
               <Box p={3}>
                  <Grid container justifyContent="space-between">
                     <h1>Список треков</h1>
                     <Button onClick={() => router.push("/tracks/create")}>
                        Загрузить
                     </Button>
                  </Grid>
               </Box>
               <TextField value={query} fullWidth onChange={e => search(e)}/>
               <TrackList tracks={tracks} />
            </Card>
         </Grid>
      </MainLayout>
   )
}

export default Index

export const getServerSideProps = wrapper.getServerSideProps(async ({ store }) => {
   const dispatch = store.dispatch as NextThunkDispatch
   await dispatch(await fetchTracks())
})
